import React from 'react';
import { format } from 'date-fns';
import { VitalReading, VITAL_CONFIGS } from '../types';
import { ShieldAlert, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AlertPanelProps {
  readings: VitalReading[];
  aiAlerts?: { issue: string; explanation: string; severity: 'warning' | 'critical' }[];
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ readings, aiAlerts = [] }) => {
  const sortedAIAlerts = [...aiAlerts].sort((a, b) => {
    const priority = { critical: 0, warning: 1 };
    return priority[a.severity] - priority[b.severity];
  });

  const thresholdAlerts = readings.flatMap(reading => {
    const criticals: { type: string; value: string; timestamp: string; isAI: boolean }[] = [];
    
    // Heart Rate
    if (reading.heartRate !== undefined && (reading.heartRate < VITAL_CONFIGS.heartRate.criticalLow || reading.heartRate > VITAL_CONFIGS.heartRate.criticalHigh)) {
      criticals.push({ type: 'Heart Rate', value: `${reading.heartRate} bpm`, timestamp: reading.timestamp, isAI: false });
    }
    
    // Systolic BP
    if (reading.systolicBP !== undefined && (reading.systolicBP < VITAL_CONFIGS.bp.criticalLow || reading.systolicBP > VITAL_CONFIGS.bp.criticalHigh)) {
      criticals.push({ type: 'Systolic BP', value: `${reading.systolicBP} mmHg`, timestamp: reading.timestamp, isAI: false });
    }
    
    // Temperature
    if (reading.temperature !== undefined && (reading.temperature < VITAL_CONFIGS.temperature.criticalLow || reading.temperature > VITAL_CONFIGS.temperature.criticalHigh)) {
      criticals.push({ type: 'Temperature', value: `${reading.temperature.toFixed(1)} °C`, timestamp: reading.timestamp, isAI: false });
    }
    
    return criticals;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (thresholdAlerts.length === 0 && sortedAIAlerts.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* AI Clinical Issues */}
      {sortedAIAlerts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-slate-800 px-6 py-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Issues (AI)</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {sortedAIAlerts.map((alert, i) => (
              <div key={i} className="px-6 py-5 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    alert.severity === 'critical' ? "bg-rose-500 text-white" : "bg-amber-500 text-black"
                  )}>
                    {alert.severity}
                  </span>
                  <h4 className="text-sm font-bold text-white">{alert.issue}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {alert.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threshold Alerts Log */}
      {thresholdAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-rose-600 px-6 py-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-white" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Threshold Alerts Log</h3>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            <div className="divide-y divide-rose-100">
              {thresholdAlerts.map((alert, i) => (
                <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-rose-100/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-rose-900 uppercase tracking-tight">{alert.type}</span>
                    <span className="text-lg font-mono font-bold text-rose-600">{alert.value}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {format(new Date(alert.timestamp), 'HH:mm:ss')}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-rose-300">
                      {format(new Date(alert.timestamp), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
