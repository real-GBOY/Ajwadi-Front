import { useState, useEffect } from 'react';
import { Specification, CreateSpecificationRequest } from '@/services/specificationService';
import { FormInput } from '@/designSystem/ui/form-input';
import IconSelectDropdown from './IconSelectDropdown';
import { useTranslation } from 'react-i18next';

interface SpecificationFormProps {
  specification?: Specification | null;
  onSubmit: (data: CreateSpecificationRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SpecificationForm({
  specification,
  onSubmit,
  onCancel,
  isLoading = false,
}: SpecificationFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateSpecificationRequest>({
    name: '',
    icon: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateSpecificationRequest, string>>>({});

  useEffect(() => {
    if (specification) {
      setFormData({
        name: specification.name || '',
        icon: specification.icon || '',
      });
    }
  }, [specification]);

  const handleChange = (field: keyof CreateSpecificationRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateSpecificationRequest, string>> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired', 'الاسم مطلوب');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <FormInput
        label={t('forms.specName', 'الاسم')}
        type="text"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder={t('forms.specNamePlaceholder', 'أدخل اسم المجال')}
        error={errors.name}
        required
      />

      {/* Icon */}
      <div className="space-y-2">
        <IconSelectDropdown
          label={t('forms.icon', 'الأيقونة')}
          value={formData.icon || ''}
          onChange={(value) => handleChange('icon', value)}
          placeholder={t('forms.iconPlaceholder', 'اختر أيقونة...')}
          error={errors.icon}
        />
        <div className="text-xs text-gray-500 rtl:text-right ltr:text-left">
          {t('forms.iconHelper', 'أو أدخل اسم ملف الأيقونة أو رابط مخصص')}
        </div>
        <FormInput
          type="text"
          value={formData.icon || ''}
          onChange={(e) => handleChange('icon', e.target.value)}
          placeholder={t('forms.iconInputPlaceholder', 'أدخل اسم ملف الأيقونة أو رابط الصورة (اختياري)')}
          className="text-sm"
        />
      </div>

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
          {isLoading ? t('actions.saving', 'جاري الحفظ...') : specification ? t('actions.update', 'تحديث') : t('actions.add', 'إضافة')}
        </button>
      </div>
    </form>
  );
}
