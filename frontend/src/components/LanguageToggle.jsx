import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English' },
  { code: 'tl', label: 'TL', flag: '🇵🇭', name: 'Tagalog' }
];

export default function LanguageToggle({ className }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && LANGUAGE_OPTIONS.find(opt => opt.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language || navigator.userLanguage;
      const autoLanguage = browserLang.startsWith('tl') || browserLang.startsWith('fil') ? 'tl' : 'en';
      setCurrentLanguage(autoLanguage);
      localStorage.setItem('language', autoLanguage);
    }

    // Listen for language changes from other components
    const handleLanguageChange = (e) => {
      if (e.detail?.language) {
        setCurrentLanguage(e.detail.language);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('language', languageCode);
    
    // Dispatch event for other components to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: languageCode } }));
    
    // Reload page to apply language changes
    window.location.reload();
  };

  const currentOption = LANGUAGE_OPTIONS.find(opt => opt.code === currentLanguage) || LANGUAGE_OPTIONS[0];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {LANGUAGE_OPTIONS.map((option) => (
        <Button
          key={option.code}
          variant={currentLanguage === option.code ? "default" : "outline"}
          size="sm"
          onClick={() => handleLanguageChange(option.code)}
          className={cn(
            "min-w-[3rem] font-medium transition-all",
            currentLanguage === option.code 
              ? "bg-primary text-primary-foreground" 
              : "bg-background hover:bg-muted"
          )}
          title={option.name}
        >
          <span className="mr-1">{option.flag}</span>
          {option.label}
        </Button>
      ))}
    </div>
  );
}

// Hook to get current language in components
export function useLanguage() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);

    const handleLanguageChange = (e) => {
      if (e.detail?.language) {
        setLanguage(e.detail.language);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  return language;
}

// Helper function to get localized content
export function getLocalizedContent(content, language = 'en') {
  if (!content) return '';
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (typeof content === 'object') {
    return content[language] || content['en'] || content['tl'] || '';
  }
  
  return content;
}

// Helper function to get localized field from database object
export function getLocalizedField(obj, fieldName, language = 'en') {
  if (!obj) return '';
  
  const languageField = `${fieldName}_${language}`;
  const englishField = `${fieldName}_en`;
  const tagalogField = `${fieldName}_tl`;
  
  // Try language-specific field first
  if (obj[languageField]) return obj[languageField];
  
  // Fallback to English
  if (obj[englishField]) return obj[englishField];
  
  // Fallback to Tagalog
  if (obj[tagalogField]) return obj[tagalogField];
  
  // Fallback to original field
  if (obj[fieldName]) return obj[fieldName];
  
  return '';
}