import React, { useState, useEffect } from "react";
import { useLanguage } from "./LanguageToggle.jsx";

export default function LanguageThemeToggle() {
  const language = useLanguage();
  const [currentLang, setCurrentLang] = useState(() => {
    // Initialize from localStorage immediately to avoid flicker
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    setCurrentLang(language);
  }, [language]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newLang = currentLang === 'en' ? 'tl' : 'en';
    setCurrentLang(newLang);
    localStorage.setItem('language', newLang);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLang } }));
    // No page reload - let components respond to language change event dynamically
  };

  return (
    <button
      onClick={handleToggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-orange-300 bg-orange-100 hover:bg-orange-200 text-orange-700 hover:text-orange-800 transition-colors font-bold text-sm shadow-md z-10"
      title={`Switch to ${currentLang === 'en' ? 'Tagalog' : 'English'}`}
    >
      {currentLang === 'en' ? 'EN' : 'TL'}
      <span className="sr-only">Switch language</span>
    </button>
  );
}