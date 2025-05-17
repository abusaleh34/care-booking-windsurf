import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Set HTML dir attribute for RTL/LTR
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      marginLeft: '10px',
      marginRight: '10px'
    }}>
      <span style={{ 
        marginRight: '10px',
        marginLeft: '10px',
        color: '#fff'
      }}>
        {t('common.language')}:
      </span>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          backgroundColor: i18n.language === 'en' ? '#ffffff' : 'transparent',
          color: i18n.language === 'en' ? '#1976d2' : '#ffffff',
          border: 'none',
          padding: '5px 10px',
          marginRight: '5px',
          cursor: 'pointer',
          borderRadius: '4px',
          fontWeight: i18n.language === 'en' ? 'bold' : 'normal'
        }}
      >
        {t('common.english')}
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        style={{
          backgroundColor: i18n.language === 'ar' ? '#ffffff' : 'transparent',
          color: i18n.language === 'ar' ? '#1976d2' : '#ffffff',
          border: 'none',
          padding: '5px 10px',
          cursor: 'pointer',
          borderRadius: '4px',
          fontWeight: i18n.language === 'ar' ? 'bold' : 'normal'
        }}
      >
        {t('common.arabic')}
      </button>
    </div>
  );
};

export default LanguageSelector;
