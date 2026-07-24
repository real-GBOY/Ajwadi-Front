import { useTranslation } from 'react-i18next';

interface CategoryData {
  label: string;
  percentage: number;
  color: string;
  icon?: string;
}

interface DonutChartProps {
  data: CategoryData[];
}

export default function DonutChart({ data }: DonutChartProps) {
  const { t } = useTranslation();
  let currentAngle = 0;

  const createArc = (percentage: number, startAngle: number) => {
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const innerRadius = 80;
    const outerRadius = 120;

    const x1 = 150 + outerRadius * Math.cos(startRad);
    const y1 = 150 + outerRadius * Math.sin(startRad);
    const x2 = 150 + outerRadius * Math.cos(endRad);
    const y2 = 150 + outerRadius * Math.sin(endRad);
    const x3 = 150 + innerRadius * Math.cos(endRad);
    const y3 = 150 + innerRadius * Math.sin(endRad);
    const x4 = 150 + innerRadius * Math.cos(startRad);
    const y4 = 150 + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 min-w-0 overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">{t('projectsByCategory')}</h3>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative w-full max-w-[280px] sm:max-w-[300px] aspect-square shrink-0">
          <svg width="100%" height="100%" viewBox="0 0 300 300" className="max-h-[280px] sm:max-h-[300px]">
            {data.map((item, index) => {
              const path = createArc(item.percentage, currentAngle);
              currentAngle += (item.percentage / 100) * 360;

              return (
                <path
                  key={index}
                  d={path}
                  fill={item.color}
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
        </div>

        <div className="flex-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm min-w-0">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-gray-700 truncate">{item.label}</span>
              <span className="text-gray-400 shrink-0">–</span>
              <span className="font-medium text-gray-900 shrink-0">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
