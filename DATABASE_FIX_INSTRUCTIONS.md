# Campaign Submission and Approval Fix - Instructions

## Problem Fixed
The campaign submission and approval workflow was not working properly due to:
1. Missing `admin_notes` column in the Supabase campaigns table
2. Incorrect column name in notifications table (`recipient_id` vs `user_id`)
3. Database join issues in CampaignApproval page
4. RLS (Row Level Security) policies preventing campaign creation

## Changes Made

### 1. Database Schema Updates
- **File**: `database/complete-workflow-fix.sql`
- **Changes**: Comprehensive fix that includes:
  - Adds the missing `admin_notes` column to campaigns table
  - Fixes campaign status constraint to include all approval workflow statuses
  - Drops and recreates all campaign RLS policies to fix permission issues
  - Drops and recreates all notification RLS policies to use correct column name
  - Includes verification queries

### 2. Frontend Code Fixes
- **File**: `frontend/src/pages/admin/CampaignApproval.jsx`
- **Changes**: Fixed the campaign fetching logic to handle database joins properly
- **File**: `frontend/src/pages/staff/Campaigns.jsx`
- **Changes**: Fixed notification creation to use correct column name (`user_id` instead of `recipient_id`) and added better error logging
- **File**: `frontend/src/pages/staff/AllCampaigns.jsx`
- **Changes**: Fixed notification creation to use correct column name (`user_id` instead of `recipient_id`)
- **File**: `frontend/src/pages/staff/Submission.jsx`
- **Changes**: Fixed notification creation to use correct column name (`user_id` instead of `recipient_id`)
- **File**: `frontend/src/lib/supabase.js`
- **Changes**: Added detailed console logging for campaign operations

## How to Apply the Fix

### Step 1: Apply Complete Database Fix
Run the comprehensive SQL script that fixes everything at once:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the **entire contents** of `database/complete-workflow-fix.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the schema

This single script will:
- ✅ Add the missing `admin_notes` column
- ✅ Fix the status constraint
- ✅ Fix all RLS policies for campaigns
- ✅ Fix all RLS policies for notifications
- ✅ Verify the setup with test queries

### Step 2: Restart the Frontend
If you have the frontend running, restart it to pick up the code changes:

```bash
cd frontend
npm run dev
```

### Step 3: Test the Complete Workflow

#### Test 1: Staff Create Campaign Draft
1. Log in as a staff user
2. Go to **Staff AI Assistant** or **Staff Campaign Management**
3. Click "New Campaign Draft"
4. Fill in the campaign details (title, objectives, category)
5. Click "Save Draft"
6. Verify the campaign appears in your campaigns list with "Not Submitted" status

#### Test 2: Staff Submit Campaign for Approval
1. With the draft created, click "Submit for Approval"
2. Verify you see the success message: "Campaign submitted for approval! Admins will review it in Campaign Approval."
3. Navigate to **Submission** page
4. Verify the campaign appears with "Pending Review" status

#### Test 3: Admin Review and Approve Campaign
1. Log in as an admin user
2. Go to **Campaign Approval**
3. Verify the submitted campaign appears in the list
4. Click **Approve** to publish the campaign
5. Verify the campaign disappears from the approval list
6. Check **Campaign Management** to see the published campaign

#### Test 4: Admin Request Revision
1. Log in as an admin user
2. Go to **Campaign Approval**
3. Click **Request Revision** on a submitted campaign
4. Add a comment explaining what needs to be changed
5. Click **Send Back to Staff**
6. Log in as staff and verify the campaign shows "Needs Revision" status with the admin comment

## Troubleshooting

### If you still see "Failed to submit campaign for approval":
1. **Check browser console** (F12) for detailed error messages
2. **Verify you're logged in** as a user with proper role (staff, admin, or super_admin)
3. **Check the SQL script ran successfully** - you should see "Setup complete" message
4. **Verify your user role** in the users table has correct value

### If campaigns still don't appear in Campaign Approval:
1. Check the browser console for errors
2. Verify the database changes were applied successfully
3. Check that the campaign status is actually "submitted" in the database
4. Ensure RLS policies allow admins to view submitted campaigns

### If notifications don't work:
1. Check the notifications table structure matches the schema
2. Verify the column name is `user_id` not `recipient_id`
3. Check that the users table has admin users with the correct role

### If you see RLS permission errors:
1. The comprehensive fix script should have resolved this
2. If not, manually run the individual scripts:
   - `database/fix-campaign-rls-policies.sql`
   - `database/fix-notifications-rls-policies.sql`

### If you see database errors:
1. Run the comprehensive script again to ensure all changes are applied
2. Check that your Supabase project is not paused
3. Verify your environment variables are correct in the frontend `.env` file

## Database Schema Verification

After applying the fix, you can verify the setup by running these queries in Supabase SQL Editor:

```sql
-- Check if admin_notes column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name = 'admin_notes';

-- Check current campaigns and their status
SELECT 
    id, 
    title, 
    status, 
    created_by, 
    admin_notes,
    created_at
FROM public.campaigns 
ORDER BY created_at DESC 
LIMIT 5;

-- Check your user role
SELECT 
    id, 
    email, 
    name, 
    role 
FROM public.users 
WHERE id = auth.uid();
```

## What Should Work Now

✅ Staff can create campaign drafts using "New Campaign Draft"
✅ Staff can save drafts without submitting
✅ Staff can submit campaigns for approval
✅ Submitted campaigns appear in the Submission page with "Pending Review" status
✅ Admins can see submitted campaigns in Campaign Approval
✅ Admins can approve, reject, or request revisions
✅ Notifications are created when campaigns are submitted/approved
✅ Admin notes are saved when requesting revisions
✅ Campaign status updates work correctly throughout the workflow
✅ No more permission errors when creating campaigns

## Expected User Flow

1. **Staff** creates campaign draft → Status: "draft"
2. **Staff** clicks "Submit for Approval" → Status: "submitted"
3. **Campaign** appears in Submission page → Status: "Pending Review"
4. **Admin** sees campaign in Campaign Approval → Status: "Pending Approval"
5. **Admin** approves → Status: "published" (visible to public)
6. **OR Admin** requests revision → Status: "needs_revision" (with admin notes)
7. **Staff** sees revision request, edits campaign, resubmits → Back to step 3