import React, { useState, useRef, useCallback } from "react";
import { UserCircle, Lock, Save, Eye, EyeOff, CheckCircle2, Camera, Upload, Phone, MapPin, Mail, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth.jsx";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper to center the crop initially
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ProfilePage() {
  const { user, setUser, validatePassword } = useAuth();
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  // Cropper states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);

  const roleLabel = user?.role === "super_admin" ? "Super Administrator"
    : user?.role === "admin" ? "Administrator"
    : user?.role === "staff" ? "Barangay Staff"
    : "Resident";

  const roleColor = user?.role === "super_admin" ? "bg-purple-600"
    : user?.role === "admin" ? "bg-primary"
    : user?.role === "staff" ? "bg-accent"
    : "bg-primary";

  // Handle avatar file selection (opens cropper)
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, etc.).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2MB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgSrc(reader.result?.toString() || "");
      setCropModalOpen(true);
    });
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  // Upload the cropped image
  const uploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) {
      setCropModalOpen(false);
      return;
    }

    setCropModalOpen(false);
    setUploadingAvatar(true);

    try {
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const crop = completedCrop;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext("2d");
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.95);
      });

      if (!blob) {
        throw new Error("Canvas is empty");
      }

      // Show preview immediately
      const previewUrl = URL.createObjectURL(blob);
      setAvatarPreview(previewUrl);

      // Upload to Supabase Storage
      const fileExt = "jpg";
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) {
        console.warn("Storage upload failed (bucket may not exist), using data URL fallback:", uploadError.message);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarUrl(reader.result);
          setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(blob);
      } else {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        setAvatarUrl(urlData.publicUrl);
        setAvatarPreview(urlData.publicUrl);
      }
    } catch (err) {
      console.warn("Avatar crop/upload error:", err);
      setError("Failed to crop and upload image.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save profile info
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const updates = {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      };

      if (avatarUrl && avatarUrl !== user?.avatar_url) {
        updates.avatar_url = avatarUrl;
      }

      const { data, error: updateErr } = await supabaseHelpers.updateUser(user.id, updates);

      if (updateErr) {
        setError(updateErr.message || "Failed to save changes.");
        return;
      }

      setUser((prev) => ({
        ...prev,
        ...updates,
        avatar_url: avatarUrl || prev?.avatar_url,
      }));

      setSaved("profile");
      setTimeout(() => setSaved(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // Update password
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwords.new || !passwords.confirm) {
      setError("Please fill in all password fields.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match.");
      return;
    }

    // Validate password using configurable requirements
    const passwordValidation = validatePassword(passwords.new);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(' '));
      return;
    }

    setSaving(true);
    try {
      const { error: pwErr } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (pwErr) {
        setError(pwErr.message || "Failed to update password.");
        return;
      }

      setSaved("password");
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setSaved(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
          <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Profile Management
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Update your personal information, avatar, and account settings.</p>
      </div>

      {/* Avatar + User Info Header */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
            <div className="relative group">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt={profile.name} />
                ) : (
                  <AvatarFallback className={`${roleColor} text-white text-lg sm:text-xl font-bold`}>
                    {profile.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploadingAvatar ? (
                  <RefreshCw className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="font-display font-bold text-base sm:text-lg truncate">{profile.name || "User"}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{profile.email}</p>
              <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${roleColor}`}>
                {roleLabel}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="shrink-0 w-full sm:w-auto"
            >
              {uploadingAvatar ? (
                <><RefreshCw className="h-4 w-4 mr-1.5 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="h-4 w-4 mr-1.5" /> Change Photo</>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Hover over the avatar or click "Change Photo" to upload a new profile picture. Max 2MB, JPG/PNG.</p>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>Update your name, contact details, and address.</CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileSave}>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Juan Dela Cruz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="pl-10 bg-muted/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone / Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="09XX XXX XXXX"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-address">Address (Purok/Street)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profile-address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Purok 1, Camarin"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {user?.role === "staff" && (
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value="Barangay Staff" disabled className="bg-muted/50" />
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            {saved === "profile" && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Profile saved successfully!
              </p>
            )}
            <Button type="submit" className="ml-auto" disabled={saving}>
              {saving ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Change Password</CardTitle>
          <CardDescription>Update your account password for security.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSave}>
          <CardContent className="space-y-4">
            {["current", "new", "confirm"].map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={`pw-${field}`}>
                  {field === "confirm" ? "Confirm New Password" : `${field.charAt(0).toUpperCase() + field.slice(1)} Password`}
                </Label>
                <div className="relative">
                  <Input
                    id={`pw-${field}`}
                    type={showPw ? "text" : "password"}
                    value={passwords[field]}
                    onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPw((s) => !s)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-between">
            {saved === "password" && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Password updated!
              </p>
            )}
            <Button type="submit" variant="outline" className="ml-auto" disabled={saving}>
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Error display */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Crop Modal */}
      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-[60vh] object-contain"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCropModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={uploadCroppedImage}>
              Crop & Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
