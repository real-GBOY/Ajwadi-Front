import { useState, useEffect } from 'react';
import { Skill, CreateSkillRequest } from '@/services/skillService';
import { useListSpecifications } from '@/hooks/specifications/useSpecifications';
import { FormInput } from '@/designSystem/ui/form-input';
import { FormSelect } from '@/designSystem/ui/form-select';
import { useTranslation } from 'react-i18next';

interface SkillsFormProps {
  skill?: Skill | null;
  onSubmit: (data: CreateSkillRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SkillsForm({
  skill,
  onSubmit,
  onCancel,
  isLoading = false,
}: SkillsFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateSkillRequest>({
    name: '',
    specificationId: null,
  });

  // Fetch specifications from API to use as specificationId options
  const { data: specificationsData, isLoading: isLoadingSpecifications } = useListSpecifications(
    {
      page: 1,
      limit: 100, // Fetch all specifications
    },
    {
      enabled: true,
    }
  );

  // Specification options from API - API expects specificationId (UUID) not name
  const specificationOptions = (specificationsData?.data || []).map((spec) => ({
    value: spec.id.toString(),
    label: spec.name,
  }));

  const [errors, setErrors] = useState<Partial<Record<keyof CreateSkillRequest, string>>>({});

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name || '',
        specificationId: skill.specificationId || null,
      });
    }
  }, [skill]);

  const handleChange = (field: keyof CreateSkillRequest, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateSkillRequest, string>> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('validation.skillNameRequired', 'اسم المهارة مطلوب');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Prepare payload according to API DTO: { name: string, specificationId?: string | null }
    const payload: CreateSkillRequest = {
      name: formData.name.trim(),
      specificationId: formData.specificationId || null,
    };
    
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name - API expects: name (string, required) */}
      <FormInput
        label={t('forms.skillName', 'اسم المهارة')}
        type="text"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder={t('forms.skillNamePlaceholder', 'أدخل اسم المهارة')}
        error={errors.name}
        required
      />

      {/* Specification - API expects: specificationId (string | null, optional) */}
      <FormSelect
        label={t('forms.specOptional', 'المجال (اختياري)')}
        value={formData.specificationId ? formData.specificationId.toString() : ''}
        onChange={(e) => {
          const value = e.target.value;
          handleChange('specificationId', value ? value : null);
        }}
        options={specificationOptions}
        placeholder={t('forms.specOptionalPlaceholder', 'اختر المجال (اختياري)')}
        isLoading={isLoadingSpecifications}
        disabled={isLoadingSpecifications}
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
          {isLoading ? t('actions.saving', 'جاري الحفظ...') : skill ? t('actions.update', 'تحديث') : t('actions.add', 'إضافة')}
        </button>
      </div>
    </form>
  );
}
