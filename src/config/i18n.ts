import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import sidebarAr from '../locales/ar/sidebar.json';
import commonAr from '../locales/ar/common.json';
import authAr from '../locales/ar/auth.json';

// Initialize i18n according to official documentation
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
              auth: authAr,
            },
          },
        },
        lng: 'ar',
        fallbackLng: 'ar',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
  }
};

// Initialize immediately when module loads
initI18n();

export default i18n;
