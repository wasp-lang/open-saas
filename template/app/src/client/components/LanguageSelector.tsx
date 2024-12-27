import React from 'react';
import { useTranslation } from 'react-i18next';
import { BiGlobe } from 'react-icons/bi';
import { cn } from '../cn';

interface LanguageSelectorProps {
  isLandingPage?: boolean;
  className?: string;
}

export default function LanguageSelector({ isLandingPage, className }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  // Initialize language from localStorage or default to 'en'
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  const changeLanguage = (lng: string) => {
    localStorage.setItem('language', lng);
    i18n.changeLanguage(lng);
  };

  return (
    <div className={cn(
      "flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-md", 
      "bg-transparent hover:bg-gray-100/10 dark:hover:bg-gray-800/50 transition-colors duration-200",
      className
    )}>
      <BiGlobe className={cn(
        "h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200", 
        {
          'text-black dark:text-white': isLandingPage,
          'text-black dark:text-gray-200': !isLandingPage,
          'hover:scale-110': true
        }
      )} />
      <select
        onChange={(e) => changeLanguage(e.target.value)}
        value={i18n.language}
        className={cn(
          "bg-transparent text-xs sm:text-sm font-semibold leading-6",
          "border-none cursor-pointer outline-none transition-colors duration-200",
          "appearance-none -mr-1",
          "focus:ring-0 focus:ring-offset-0",
          isLandingPage 
            ? 'text-black dark:text-white hover:text-yellow-500'
            : 'text-black hover:text-yellow-500 dark:text-gray-200 dark:hover:text-yellow-500'
        )}
      >
        <option 
          value="en" 
          className="text-black dark:text-gray-200 bg-white dark:bg-gray-800 text-xs sm:text-sm"
        >
          EN
        </option>
        <option 
          value="es" 
          className="text-black dark:text-gray-200 bg-white dark:bg-gray-800 text-xs sm:text-sm"
        >
          ES
        </option>
      </select>
    </div>
  );
} 