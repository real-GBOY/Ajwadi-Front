import { useState, useEffect } from 'react';
import { PrivacyPolicy, CreatePrivacyPolicyRequest } from '@/services/privacyPolicyService';
import { FormInput } from '@/designSystem/ui/form-input';
import { FormTextarea } from '@/designSystem/ui/form-textarea';
import { FormSelect } from '@/designSystem/ui/form-select';

interface PrivacyPolicyFormProps {
  privacyPolicy?: PrivacyPolicy | null;
  onSubmit: (data: CreatePrivacyPolicyRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PrivacyPolicyForm({
  privacyPolicy,
  onSubmit,
  onCancel,
  isLoading = false,
}: PrivacyPolicyFormProps) {
  // API DTO: { title: string, content: string, language?: "en" | "ar" | "fr" | "es" }
  const [formData, setFormData] = useState<CreatePrivacyPolicyRequest>({
    title: '',
    content: '',
    language: 'ar',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePrivacyPolicyRequest, string>>>({});

  useEffect(() => {
    if (privacyPolicy) {
      setFormData({
        title: privacyPolicy.title || '',
        content: privacyPolicy.content || '',
        language: privacyPolicy.language || 'ar',
      });
    }
  }, [privacyPolicy]);

  const handleChange = (field: keyof CreatePrivacyPolicyRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePrivacyPolicyRequest, string>> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'العنوان مطلوب';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'المحتوى مطلوب';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const languageOptions = [
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title - API expects: title (string, required, max 200 chars) */}
      <FormInput
        label="العنوان"
        type="text"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="أدخل العنوان"
        error={errors.title}
        required
        maxLength={200}
        dir="rtl"
      />

      {/* Content - API expects: content (string, required) */}
      <FormTextarea
        label="المحتوى"
        value={formData.content}
        onChange={(e) => handleChange('content', e.target.value)}
        rows={8}
        placeholder="أدخل محتوى سياسة الخصوصية"
        error={errors.content}
        required
        dir="rtl"
      />

      {/* Language - API expects: language (enum: "en" | "ar" | "fr" | "es", optional, defaults to "en") */}
      <FormSelect
        label="اللغة"
        value={formData.language || 'ar'}
        onChange={(e) => handleChange('language', e.target.value as 'en' | 'ar' | 'fr' | 'es')}
        options={languageOptions}
        placeholder="اختر اللغة"
        dir="rtl"
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'جاري الحفظ...' : privacyPolicy ? 'تحديث' : 'إضافة'}
        </button>
      </div>
    </form>
  );
}
