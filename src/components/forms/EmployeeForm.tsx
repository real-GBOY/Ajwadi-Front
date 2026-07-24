import { useState, useEffect } from 'react';
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/services/employeeService';
import { FormInput } from '@/designSystem/ui/form-input';
import { FormSelect } from '@/designSystem/ui/form-select';

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EmployeeForm({
  employee,
  onSubmit,
  onCancel,
  isLoading = false,
}: EmployeeFormProps) {
  // For create: all fields required. For update: all optional
  const [formData, setFormData] = useState<CreateEmployeeRequest | UpdateEmployeeRequest>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    roleId: '',
    status: 'inactive',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof (CreateEmployeeRequest | UpdateEmployeeRequest), string>>>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        address: employee.address || '',
        roleId: employee.roleId || '',
        status: (employee.status as 'active' | 'inactive' | 'suspended') || 'inactive',
        // Don't populate password for edit
      });
    } else {
      // Reset form for new employee
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        roleId: '',
        status: 'inactive',
      });
    }
  }, [employee]);

  const handleChange = (field: keyof (CreateEmployeeRequest | UpdateEmployeeRequest), value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof (CreateEmployeeRequest | UpdateEmployeeRequest), string>> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    // Password required only for create
    if (!employee && !formData.password?.trim()) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (!employee && formData.password && formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'رقم الجوال مطلوب';
    }
    
    if (!formData.address?.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }
    
    if (!employee && !formData.roleId?.trim()) {
      newErrors.roleId = 'الدور مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Prepare payload - remove password if empty for update
    const payload = { ...formData };
    if (employee && !payload.password?.trim()) {
      delete (payload as any).password;
    }
    
    await onSubmit(payload);
  };

  const statusOptions = [
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' },
    { value: 'suspended', label: 'معلق' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <FormInput
        label="الاسم"
        type="text"
        value={formData.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="أدخل اسم الموظف"
        error={errors.name}
        required
        dir="rtl"
      />

      {/* Email */}
      <FormInput
        label="البريد الإلكتروني"
        type="email"
        value={formData.email || ''}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="example@email.com"
        error={errors.email}
        required
        dir="ltr"
      />

      {/* Password - Required for create, optional for update */}
      <FormInput
        label={employee ? 'كلمة المرور (اتركها فارغة للحفاظ على الكلمة الحالية)' : 'كلمة المرور'}
        type="password"
        value={formData.password || ''}
        onChange={(e) => handleChange('password', e.target.value)}
        placeholder={employee ? 'اتركها فارغة للحفاظ على الكلمة الحالية' : 'أدخل كلمة المرور'}
        error={errors.password}
        required={!employee}
        dir="ltr"
      />

      {/* Phone */}
      <FormInput
        label="رقم الجوال"
        type="tel"
        value={formData.phone || ''}
        onChange={(e) => handleChange('phone', e.target.value)}
        placeholder="+1234567890"
        error={errors.phone}
        required
        dir="ltr"
      />

      {/* Address */}
      <FormInput
        label="العنوان"
        type="text"
        value={formData.address || ''}
        onChange={(e) => handleChange('address', e.target.value)}
        placeholder="أدخل العنوان"
        error={errors.address}
        required
        dir="rtl"
      />

      {/* Role ID - For now as text input, can be changed to dropdown if roles API exists */}
      <FormInput
        label="معرف الدور (Role ID)"
        type="text"
        value={formData.roleId || ''}
        onChange={(e) => handleChange('roleId', e.target.value)}
        placeholder="أدخل معرف الدور"
        error={errors.roleId}
        required={!employee}
        dir="ltr"
      />

      {/* Status */}
      <FormSelect
        label="الحالة"
        value={formData.status || 'inactive'}
        onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive' | 'suspended')}
        options={statusOptions}
        placeholder="اختر الحالة"
        dir="rtl"
      />

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto">
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto">
          {isLoading ? 'جاري الحفظ...' : employee ? 'تحديث' : 'إضافة'}
        </button>
      </div>
    </form>
  );
}
