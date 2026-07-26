/** @format */

import { useState, useEffect, useRef } from 'react';
import { SPECIFICATION_ICONS, type IconOption } from '@/utils/specificationIcons';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface IconSelectDropdownProps {
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export default function IconSelectDropdown({
  label,
  error,
  required,
  placeholder,
  dir = 'rtl',
  value = '',
  onChange,
  disabled = false,
  className = '',
  name,
  id,
}: IconSelectDropdownProps) {
  const { t } = useTranslation();
  const placeholderText = placeholder || t('forms.iconPlaceholder', 'اختر أيقونة...');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedIcon = SPECIFICATION_ICONS.find((icon) => icon.value === value);

  const handleSelect = (iconValue: string) => {
    onChange?.(iconValue);
    setIsOpen(false);
  };

  const buttonClasses = `w-full px-4 py-2.5 pr-10 bg-white border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm flex items-center justify-between gap-3 ${
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 hover:border-gray-400 focus:border-primary'
  } ${dir === 'ltr' ? 'text-left' : 'text-right'} ${
    disabled
      ? 'opacity-60 cursor-not-allowed bg-gray-50 hover:border-gray-300'
      : 'cursor-pointer'
  } ${className}`;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 rtl:text-right ltr:text-left">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div ref={containerRef} className="relative">
        {/* Hidden input for form submission */}
        <input
          type="hidden"
          name={name}
          id={id}
          value={value}
          readOnly
        />

        {/* Custom dropdown button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={buttonClasses}
          aria-expanded={isOpen}
          aria-haspopup="listbox">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedIcon ? (
              <>
                <div className="flex-shrink-0 text-gray-600">
                  <selectedIcon.component size={20} active={false} isRTL={dir === 'rtl'} />
                </div>
                <span className="text-gray-900 truncate">{selectedIcon.label}</span>
              </>
            ) : (
              <span className="text-gray-500">{placeholderText}</span>
            )}
          </div>
          <div className="flex-shrink-0">
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown menu */}
        {isOpen && !disabled && (
          <div
            className={`absolute top-full mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 ${
              dir === 'ltr' ? 'left-0' : 'right-0'
            }`}
            dir={dir}
            role="listbox"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9',
            }}>
            {SPECIFICATION_ICONS.length > 0 ? (
              <div className="py-1">
                {SPECIFICATION_ICONS.map((icon, index) => {
                  const IconComponent = icon.component;
                  const isSelected = icon.value === value;
                  
                  return (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => handleSelect(icon.value)}
                      className={`w-full px-4 py-3 text-sm transition-colors flex items-center gap-3 ${
                        index === 0 ? 'rounded-t-xl' : ''
                      } ${
                        index === SPECIFICATION_ICONS.length - 1 ? 'rounded-b-xl' : ''
                      } ${
                        dir === 'ltr' ? 'text-left' : 'text-right'
                      } ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                      role="option"
                      aria-selected={isSelected}>
                      <div className="flex-shrink-0 text-gray-600">
                        <IconComponent size={24} active={isSelected} isRTL={dir === 'rtl'} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{icon.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{icon.category}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className={`px-4 py-2.5 text-sm text-gray-500 ${
                  dir === 'ltr' ? 'text-left' : 'text-right'
                }`}>
                {t('forms.noIcons', 'لا توجد أيقونات متاحة')}
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 rtl:text-right ltr:text-left">{error}</p>
      )}
    </div>
  );
}
