import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { VitalReading, VitalType, VITAL_CONFIGS } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VitalCardProps {
  type: VitalType;
  readings: VitalReading[];
}

export const VitalCard: React.FC<VitalCardProps> = ({ type, readings }) => {
  const config = VITAL_CONFIGS[type];
  const latest = readings[readings.length - 1];
  const previous = readings[readings.length - 2];

  if (!latest) return null;

  let value: string | number = '';
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let isCritical = false;

  if (type === 'bp') {
    value = `${Math.round(latest.systolicBP)}/${Math.round(latest.diastolicBP)}`;
    const prevSys = previous?.systolicBP || latest.systolicBP;
    trend = latest.systolicBP > prevSys ? 'up' : latest.systolicBP < prevSys ? 'down' : 'stable';
    isCritical = latest.systolicBP < config.criticalLow || latest.systolicBP > config.criticalHigh;
  } else {
    const val = latest[type] as number;
    value = val.toFixed(type === 'temperature' ? 1 : 0);
    const prevVal = (previous?.[type] as number) || val;
    trend = val > prevVal ? 'up' : val < prevVal ? 'down' : 'stable';
    
    if (val < config.criticalLow || val > config.criticalHigh) isCritical = true;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden p-5 rounded-2xl border transition-all duration-300",
        isCritical 
          ? "bg-rose-50 border-rose-200 shadow-rose-100 shadow-lg" 
          : "bg-white border-slate-200 shadow-sm hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {config.label}
          </span>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-3xl font-bold font-mono tracking-tighter",
              isCritical ? "text-rose-600" : "text-slate-900"
            )}>
              {value}
            </span>
            <span className="text-xs font-medium text-slate-400">{config.unit}</span>
          </div>
        </div>
        
        <div className={cn(
          "p-2 rounded-lg",
          isCritical ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-400"
        )}>
          {trend === 'up' && <TrendingUp className="w-4 h-4" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4" />}
          {trend === 'stable' && <div className="w-4 h-1 bg-current rounded-full" />}
        </div>
      </div>

      {isCritical && (
        <div className="flex items-center gap-2 text-rose-600 text-[10px] font-bold uppercase tracking-tight">
          <AlertTriangle className="w-3 h-3" />
          Critical Threshold
        </div>
      )}

      {/* Sparkline simulation or mini trend */}
      <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1 }}
          className={cn(
            "h-full rounded-full",
            isCritical ? "bg-rose-500" : "bg-slate-900"
          )}
          style={{ opacity: 0.2 }}
        />
      </div>
    </motion.div>
  );
};
