import React from 'react';
import { format } from 'date-fns';
import { VitalReading } from '../types';
import { ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HistoryTableProps {
  readings: VitalReading[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ readings, selectedIndex, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Historical Log</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{readings.length} Entries Recorded</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">HR</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">BP</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">SpO2</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Temp</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {readings.slice().reverse().map((reading, idx) => {
              const actualIndex = readings.length - 1 - idx;
              const isSelected = actualIndex === selectedIndex;
              
              return (
                <tr 
                  key={reading.timestamp + idx}
                  onClick={() => onSelect(actualIndex)}
                  className={cn(
                    "group cursor-pointer transition-colors",
                    isSelected ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={cn("text-sm font-semibold", isSelected ? "text-white" : "text-slate-900")}>
                        {reading.patientName || 'Unknown'}
                      </span>
                      <span className={cn("text-[10px] font-medium", isSelected ? "text-slate-400" : "text-slate-400")}>
                        ID: {reading.patientId || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={cn("text-sm font-semibold", isSelected ? "text-white" : "text-slate-900")}>
                        {format(new Date(reading.timestamp), 'HH:mm:ss')}
                      </span>
                      <span className={cn("text-[10px] font-medium", isSelected ? "text-slate-400" : "text-slate-400")}>
                        {format(new Date(reading.timestamp), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn("text-sm font-mono font-bold", isSelected ? "text-rose-400" : "text-rose-500")}>
                      {reading.heartRate ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn("text-sm font-mono font-bold", isSelected ? "text-blue-400" : "text-blue-500")}>
                      {reading.systolicBP ?? '—'}{reading.diastolicBP !== undefined ? `/${reading.diastolicBP}` : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn("text-sm font-mono font-bold", isSelected ? "text-emerald-400" : "text-emerald-500")}>
                      {reading.spo2 !== undefined ? `${reading.spo2}%` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn("text-sm font-mono font-bold", isSelected ? "text-amber-400" : "text-amber-500")}>
                      {reading.temperature !== undefined ? `${reading.temperature.toFixed(1)}°` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      isSelected ? "text-white translate-x-1" : "text-slate-300 group-hover:text-slate-500"
                    )} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
