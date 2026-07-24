import { TextareaHTMLAttributes, forwardRef } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  dir?: 'rtl' | 'ltr';
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, required, dir = 'rtl', className = '', ...props }, ref) => {
    const textareaClasses = `w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm resize-y ${
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 hover:border-gray-400 focus:border-primary'
    } ${dir === 'ltr' ? 'font-english text-left' : 'text-right'} ${className}`;

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <textarea ref={ref} className={textareaClasses} dir={dir} {...props} />
        {error && (
          <p className="mt-1.5 text-sm text-red-500 text-right">{error}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
