import { useState, useEffect, useRef, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  isLoading?: boolean;
  dir?: 'rtl' | 'ltr';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      required,
      options,
      placeholder = 'اختر...',
      isLoading = false,
      dir = 'rtl',
      value = '',
      onChange,
      disabled = false,
      className = '',
      name,
      id,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
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

    const selectedOption = options.find((opt) => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : (isLoading ? 'جاري التحميل...' : placeholder);

    const handleSelect = (optionValue: string) => {
      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = optionValue;
        if (onChange) {
          const event = new Event('change', { bubbles: true });
          Object.defineProperty(event, 'target', {
            writable: false,
            value: hiddenSelectRef.current,
          });
          hiddenSelectRef.current.dispatchEvent(event);
          // Also call onChange directly with a synthetic event
          const syntheticEvent = {
            target: { value: optionValue, name: name || '' },
            currentTarget: { value: optionValue, name: name || '' },
          } as React.ChangeEvent<HTMLSelectElement>;
          onChange(syntheticEvent);
        }
      }
      setIsOpen(false);
    };

    const buttonClasses = `w-full px-4 py-2.5 pr-10 bg-white border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm flex items-center justify-between ${
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 hover:border-gray-400 focus:border-primary'
    } ${dir === 'ltr' ? 'text-left' : 'text-right'} ${
      disabled || isLoading
        ? 'opacity-60 cursor-not-allowed bg-gray-50 hover:border-gray-300'
        : 'cursor-pointer'
    } ${className}`;

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <div ref={containerRef} className="relative">
          {/* Hidden select for form submission */}
          <select
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              hiddenSelectRef.current = node;
            }}
            value={value}
            onChange={onChange}
            disabled={disabled || isLoading}
            name={name}
            id={id}
            className="sr-only"
            aria-hidden="true">
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown button */}
          <button
            type="button"
            onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
            disabled={disabled || isLoading}
            className={buttonClasses}
            aria-expanded={isOpen}
            aria-haspopup="listbox">
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {displayValue}
            </span>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {isLoading ? (
                <svg
                  className="w-5 h-5 text-gray-400 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </div>
          </button>

          {/* Dropdown menu */}
          {isOpen && !disabled && !isLoading && (
            <div
              className={`absolute top-full mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 ${
                dir === 'ltr' ? 'left-0' : 'right-0'
              }`}
              dir={dir}
              role="listbox"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9',
              }}>
              {options.length > 0 ? (
                <div className="py-1">
                  {options.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full px-4 py-2.5 text-sm transition-colors ${
                        index === 0 ? 'rounded-t-xl' : ''
                      } ${
                        index === options.length - 1 ? 'rounded-b-xl' : ''
                      } ${
                        dir === 'ltr' ? 'text-left' : 'text-right'
                      } ${
                        option.value === value
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                      role="option"
                      aria-selected={option.value === value}>
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className={`px-4 py-2.5 text-sm text-gray-500 ${
                    dir === 'ltr' ? 'text-left' : 'text-right'
                  }`}>
                  لا توجد خيارات متاحة
                </div>
              )}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 text-right">{error}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
