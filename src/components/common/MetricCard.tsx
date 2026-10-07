import React from 'react';
import { ComparisonDelta } from '../../types';
import { ComparisonBadge } from './ComparisonBadge';
import { Tooltip } from './Tooltip';

interface MetricCardProps {
  title: string;
  value: string;
  delta?: ComparisonDelta;
  tooltip?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  delta,
  tooltip,
  subtitle,
  icon,
  accentColor = '#3b82f6',
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative bg-[#0e1526] border border-[#1c263d] rounded-xl p-5 transition-all duration-200 hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-950/50 group ${
        onClick ? 'cursor-pointer hover:bg-[#131d33]' : ''
      } ${className}`}
    >
      {/* Top Header: Title + Tooltip + Optional Icon */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-[#94a3b8] tracking-wide uppercase">
            {title}
          </span>
          {tooltip && <Tooltip content={tooltip} />}
        </div>
        {icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all shadow-sm"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Primary Value */}
      <div className="mb-2">
        <div className="text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-[#f1f5f9] tabular-nums">
          {value}
        </div>
      </div>

      {/* Footer: Delta + Subtitle */}
      <div className="flex flex-wrap items-center justify-between gap-y-1 gap-x-2 pt-1.5 border-t border-[#1c263d] text-xs">
        {delta && <ComparisonBadge delta={delta} />}
        {subtitle && (
          <span className="text-[#64748b] text-[11px] truncate" title={subtitle}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
