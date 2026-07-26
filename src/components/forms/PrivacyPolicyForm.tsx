import { useState, useEffect } from 'react';
import { PrivacyPolicy, CreatePrivacyPolicyRequest } from '@/services/privacyPolicyService';
import { FormInput } from '@/designSystem/ui/form-input';
import { FormTextarea } from '@/designSystem/ui/form-textarea';
import { FormSelect } from '@/designSystem/ui/form-select';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      newErrors.title = t('validation.titleRequired', 'العنوان مطلوب');
    }
    if (!formData.content.trim()) {
      newErrors.content = t('validation.contentRequired', 'المحتوى مطلوب');
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
    { value: 'ar', label: t('forms.arabic', 'العربية') },
    { value: 'en', label: t('forms.english', 'English') },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title - API expects: title (string, required, max 200 chars) */}
      <FormInput
        label={t('forms.title', 'العنوان')}
        type="text"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder={t('forms.titlePlaceholder', 'أدخل العنوان')}
        error={errors.title}
        required
        maxLength={200}
      />

      {/* Content - API expects: content (string, required) */}
      <FormTextarea
        label={t('forms.content', 'المحتوى')}
        value={formData.content}
        onChange={(e) => handleChange('content', e.target.value)}
        rows={8}
        placeholder={t('forms.contentPlaceholder', 'أدخل محتوى سياسة الخصوصية')}
        error={errors.content}
        required
      />

      {/* Language - API expects: language (enum: "en" | "ar" | "fr" | "es", optional, defaults to "en") */}
      <FormSelect
        label={t('forms.language', 'اللغة')}
        value={formData.language || 'ar'}
        onChange={(e) => handleChange('language', e.target.value as 'en' | 'ar' | 'fr' | 'es')}
        options={languageOptions}
        placeholder={t('forms.languagePlaceholder', 'اختر اللغة')}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          {t('actions.cancel', 'إلغاء')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? t('actions.saving', 'جاري الحفظ...') : privacyPolicy ? t('actions.update', 'تحديث') : t('actions.add', 'إضافة')}
        </button>
      </div>
    </form>
  );
}
