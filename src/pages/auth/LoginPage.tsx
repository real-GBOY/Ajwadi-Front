import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '@/services/employeeService';

export default function LoginPage() {
   const { t } = useTranslation();
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
         const errorMessage = err?.response?.data?.message || err?.message || 'حدث خطأ أثناء تسجيل الدخول';
         setError(errorMessage);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20" dir="rtl">
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
               {/* Email Field */}
               <div>
                  <label
                     htmlFor="email"
                     className="block text-sm font-medium text-gray-700 mb-2 text-right">
                     {t('auth.email')}
                  </label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right"
                        placeholder={t('auth.emailPlaceholder')}
                        required
                     />
                  </div>
               </div>

               {/* Password Field */}
               <div>
                  <label
                     htmlFor="password"
                     className="block text-sm font-medium text-gray-700 mb-2 text-right">
                     {t('auth.password')}
                  </label>
                  <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right"
                        placeholder={t('auth.passwordPlaceholder')}
                        required
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
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
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-right">
                     {error}
                  </div>
               )}

               {/* Login Button */}
               <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'جاري تسجيل الدخول...' : t('auth.login')}
               </button>
            </form>
         </div>
      </div>
   );
}
