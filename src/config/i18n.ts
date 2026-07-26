import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import sidebarAr from '../locales/ar/sidebar.json';
import commonAr from '../locales/ar/common.json';
import authAr from '../locales/ar/auth.json';
import pagesAr from '../locales/ar/pages.json';
import sidebarEn from '../locales/en/sidebar.json';
import commonEn from '../locales/en/common.json';
import authEn from '../locales/en/auth.json';
import pagesEn from '../locales/en/pages.json';

const updateDomDirection = (lng: string) => {
  const dir = lng === 'en' ? 'ltr' : 'rtl';
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lng);
  }
};

const savedLang = (typeof localStorage !== 'undefined' && localStorage.getItem('app_language')) || 'ar';

const initI18n = () => {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .init({
        resources: {
          ar: {
            translation: {
              ...sidebarAr,
              ...commonAr,
              ...authAr,
              ...pagesAr,
              auth: authAr,
              pages: pagesAr,
            },
          },
          en: {
            translation: {
              ...sidebarEn,
              ...commonEn,
              ...authEn,
              ...pagesEn,
              auth: authEn,
              pages: pagesEn,
            },
          },
        },
        lng: savedLang,
        fallbackLng: 'ar',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });

    updateDomDirection(savedLang);

    i18n.on('languageChanged', (lng) => {
      updateDomDirection(lng);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('app_language', lng);
      }
    });
  }
};

initI18n();

export default i18n;
