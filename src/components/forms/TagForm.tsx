import { useState, useEffect, useRef } from 'react';
import { Tag, CreateTagRequest } from '@/services/tagService';
import { FormInput } from '@/designSystem/ui/form-input';
import { uploadFile } from '@/services/s3Service';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TagFormProps {
  tag?: Tag | null;
  onSubmit: (data: CreateTagRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TagForm({
  tag,
  onSubmit,
  onCancel,
  isLoading = false,
}: TagFormProps) {
  const { t } = useTranslation();
  // API DTO: { name: string, badgeUrl?: array }
  const [formData, setFormData] = useState<CreateTagRequest>({
    name: '',
    badgeUrl: undefined,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Partial<Record<keyof CreateTagRequest, string>>>({});

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name || '',
        badgeUrl: undefined, // badgeUrl is for file upload, not for editing existing tag
      });
      if (tag.badgeUrl) {
        setPreviewUrl(tag.badgeUrl);
      }
    }
  }, [tag]);

  const handleChange = (field: keyof CreateTagRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      setUploadError(t('validation.imageOnly', 'يرجى اختيار ملف صورة فقط'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t('validation.fileSizeLimit', 'حجم الملف يجب أن يكون أقل من 5 ميجابايت'));
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    // Clear badgeUrl when removing file
    setFormData((prev) => ({ ...prev, badgeUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTagRequest, string>> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('validation.tagNameRequired', 'اسم العلامة مطلوب');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      // If a new file is selected, upload it first
      if (selectedFile) {
        const fileInfo = await uploadFile(
          selectedFile,
          selectedFile.name,
          'tag',
          'image'
        );

        // Set badgeUrl with uploaded file info
        setFormData((prev) => ({
          ...prev,
          badgeUrl: [
            {
              fileId: fileInfo.fileId,
              token: fileInfo.token,
              purpose: fileInfo.purpose,
            },
          ],
        }));

        // Submit with uploaded file info
        await onSubmit({
          name: formData.name.trim(),
          badgeUrl: [
            {
              fileId: fileInfo.fileId,
              token: fileInfo.token,
              purpose: fileInfo.purpose,
            },
          ],
        });
      } else {
        // No new file, submit as is
        await onSubmit(formData);
      }
    } catch (error: any) {
      setUploadError(error.message || t('appData.imageLoadFailed', 'فشل في رفع الملف'));
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name - API expects: name (string, required) */}
      <FormInput
        label={t('forms.tagName', 'اسم العلامة')}
        type="text"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder={t('forms.tagNamePlaceholder', 'أدخل اسم العلامة')}
        error={errors.name}
        required
      />

      {/* Badge Upload - API expects: badgeUrl (array, optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 rtl:text-right ltr:text-left">
          {t('forms.badgeOptional', 'الشارة (اختياري)')}
        </label>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="badge-upload"
          disabled={isUploading || isLoading}
        />

        {/* Upload Area */}
        {!previewUrl ? (
          <label
            htmlFor="badge-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              isUploading || isLoading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5'
            }`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`w-8 h-8 mb-2 ${isUploading || isLoading ? 'text-gray-400' : 'text-gray-400'}`} />
              <p className="mb-2 text-sm text-gray-500 text-center">
                <span className="font-semibold">{t('forms.clickToUpload', 'انقر للرفع')}</span> {t('forms.orDrag', 'أو اسحب الملف هنا')}
              </p>
              <p className="text-xs text-gray-500">{t('forms.fileTypes', 'PNG, JPG, GIF حتى 5MB')}</p>
            </div>
          </label>
        ) : (
          <div className="relative">
            <div className="relative w-full h-48 border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
              <img
                src={previewUrl}
                alt="Badge preview"
                className="w-full h-full object-contain"
              />
              {!isUploading && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title={t('forms.removeImage', 'إزالة الصورة')}>
                  <X className="w-4 h-4" />
                </button>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            {!isUploading && (
              <label
                htmlFor="badge-upload"
                className="mt-2 block text-center text-sm text-primary hover:text-primary-dark cursor-pointer">
                {t('forms.changeImage', 'تغيير الصورة')}
              </label>
            )}
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <p className="mt-2 text-sm text-red-600 rtl:text-right ltr:text-left">{uploadError}</p>
        )}
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
          disabled={isLoading || isUploading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('actions.uploading', 'جاري الرفع...')}</span>
            </>
          ) : isLoading ? (
            t('actions.saving', 'جاري الحفظ...')
          ) : tag ? (
            t('actions.update', 'تحديث')
          ) : (
            t('actions.add', 'إضافة')
          )}
        </button>
      </div>
    </form>
  );
}
