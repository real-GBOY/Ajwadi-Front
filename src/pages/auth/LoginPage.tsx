import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertTriangle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '@/services/employeeService';

export default function LoginPage() {
   const { t, i18n } = useTranslation();
   const navigate = useNavigate();
   const [showPassword, setShowPassword] = useState(false);
   const [email, setEmail] = useState('admin@ajwadi.com');
   const [password, setPassword] = useState('admin123');
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
         const response = await employeeService.login({ email, password });
         
         // Store token in localStorage
         localStorage.setItem('accessToken', response.token);
         
         // Store employee data for chat and other features
         localStorage.setItem('employee', JSON.stringify(response.employee));
         
         // Navigate to dashboard
         navigate('/dashboard');
      } catch (err: any) {
         const errorMessage = err?.response?.data?.message || err?.message || t('auth.loginError', 'حدث خطأ أثناء تسجيل الدخول');
         setError(errorMessage);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 relative">
         {/* Language Switcher */}
         <button
            type="button"
            onClick={() => {
               const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
               i18n.changeLanguage(nextLang);
            }}
            className="absolute top-6 end-6 flex items-center gap-2 px-3.5 py-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 rounded-xl shadow-sm border border-gray-200/60 text-sm font-medium transition-all"
         >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
         </button>
         {/* Login Form Container */}
         <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-8">
               <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-sm transform rotate-45"></div>
               </div>
               <span className="text-2xl font-bold text-gray-900">{t('sidebar.appName')}</span>
            </div>

            {/* Welcome Section */}
            <div className="text-center mb-8">
               <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('auth.welcomeBack')}
               </h1>
               <p className="text-gray-600">
                  {t('auth.enterCredentials')}
               </p>
            </div>

            {/* Demo Notice */}
            <div className="flex gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm mb-6 text-start">
               <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
               <div>
                  <p className="font-semibold">{t('auth.demoNoticeTitle')}</p>
                  <p>{t('auth.demoNoticeBody')}</p>
                  <p className="mt-1">{t('auth.demoNoticePurpose')}</p>
               </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
               {/* Email Field */}
               <div>
                  <label
                     htmlFor="email"
                     className="block text-sm font-medium text-gray-700 mb-2 text-start">
                     {t('auth.email')}
                  </label>
                  <div className="relative">
                     <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full ps-10 pe-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-start"
                        placeholder={t('auth.emailPlaceholder')}
                        required
                     />
                  </div>
               </div>

               {/* Password Field */}
               <div>
                  <label
                     htmlFor="password"
                     className="block text-sm font-medium text-gray-700 mb-2 text-start">
                     {t('auth.password')}
                  </label>
                  <div className="relative">
                     <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full ps-10 pe-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-start"
                        placeholder={t('auth.passwordPlaceholder')}
                        required
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                        {showPassword ? (
                           <EyeOff className="w-5 h-5" />
                        ) : (
                           <Eye className="w-5 h-5" />
                        )}
                     </button>
                  </div>
               </div>

               {/* Error Message */}
               {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-start">
                     {error}
                  </div>
               )}

               {/* Login Button */}
               <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? t('loading.general', 'جاري تسجيل الدخول...') : t('auth.login')}
               </button>
            </form>
         </div>
      </div>
   );
}
