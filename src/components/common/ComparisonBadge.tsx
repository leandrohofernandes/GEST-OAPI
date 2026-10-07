import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { ComparisonDelta } from '../../types';
import { formatPercent } from '../../utils/calculations';

interface ComparisonBadgeProps {
  delta: ComparisonDelta;
  suffix?: string;
  hideArrow?: boolean;
}

export const ComparisonBadge: React.FC<ComparisonBadgeProps> = ({
  delta,
  suffix = 'vs mês ant.',
  hideArrow = false
}) => {
  if (delta.percent === null && delta.diff === null) {
    return <span className="text-xs text-[#6b7180] font-mono">—</span>;
  }

  const isPositive = delta.isPositive;
  const isZero = delta.diff === 0 || (delta.percent !== null && Math.abs(delta.percent) < 0.05);

  let textColor = 'text-[#a6abb8]';
  let Icon = Minus;

  if (!isZero && isPositive !== null) {
    if (isPositive) {
      textColor = 'text-[#34d399]';
      Icon = ArrowUpRight;
    } else {
      textColor = 'text-[#fb7185]';
      Icon = ArrowDownRight;
    }
  }

  const sign = delta.percent !== null && delta.percent > 0 ? '+' : '';
  const textValue = delta.percent !== null
    ? `${sign}${formatPercent(delta.percent)}`
    : (delta.diff !== null && delta.diff > 0 ? `+${delta.diff}` : `${delta.diff}`);

  return (
    <div className={`inline-flex items-center gap-1 text-xs font-mono tabular-nums ${textColor}`}>
      {!hideArrow && !isZero && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="font-semibold">{textValue}</span>
      {suffix && <span className="text-[#6b7180] font-sans font-normal ml-0.5">{suffix}</span>}
    </div>
  );
};
