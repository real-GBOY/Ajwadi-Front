import { useTranslation } from 'react-i18next';

interface CountryData {
  name: string;
  percentage: number;
  color: string;
}

interface SalesByCountriesProps {
  data: CountryData[];
}

export default function SalesByCountries({ data }: SalesByCountriesProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('freelancersByCountry')}</h3>

      <div className="flex gap-8">
        <div className="flex-1 space-y-3">
          {data.map((country, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: country.color }}></div>
                <span className="text-sm text-gray-700">{country.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{country.percentage}%</span>
            </div>
          ))}
        </div>

        <div className="w-48 h-48 relative">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path
              d="M140 20 L160 25 L165 35 L170 30 L175 35 L172 45 L178 50 L175 60 L170 65 L160 70 L155 75 L150 72 L145 75 L140 72 L135 78 L130 75 L125 80 L120 77 L115 82 L110 78 L105 80 L100 75 L95 78 L90 73 L85 75 L80 70 L78 65 L75 60 L72 55 L70 50 L75 45 L80 40 L85 35 L90 32 L95 35 L100 30 L105 35 L110 30 L115 35 L120 32 L125 38 L130 35 L135 30 L140 20 Z"
              fill="#10b981"
              className="opacity-40"
            />
            <path
              d="M95 90 L100 85 L105 88 L110 85 L115 90 L120 87 L125 92 L130 95 L135 100 L140 105 L142 110 L145 115 L143 120 L140 125 L135 128 L130 125 L125 128 L120 125 L115 130 L110 127 L105 130 L100 135 L95 132 L90 135 L85 130 L82 125 L80 120 L78 115 L80 110 L82 105 L85 100 L90 95 L95 90 Z"
              fill="#10b981"
              className="opacity-60"
            />
            <circle cx="155" cy="55" r="3" fill="#10b981" className="opacity-80" />
            <circle cx="125" cy="110" r="4" fill="#10b981" />
          </svg>
        </div>
      </div>
    </div>
  );
}
