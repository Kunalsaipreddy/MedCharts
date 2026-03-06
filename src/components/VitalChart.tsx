import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { format } from 'date-fns';
import { VitalReading, VITAL_CONFIGS } from '../types';
import { ZoomIn, RotateCcw } from 'lucide-react';

interface VitalChartProps {
  readings: VitalReading[];
}

const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey } = props;
  const config = Object.values(VITAL_CONFIGS).find(c => {
    if (dataKey === 'heartRate') return c.label === 'Heart Rate';
    if (dataKey === 'systolicBP') return c.label === 'Systolic BP';
    if (dataKey === 'diastolicBP') return c.label === 'Diastolic BP';
    if (dataKey === 'spo2') return c.label === 'SpO2';
    if (dataKey === 'temperature') return c.label === 'Temperature';
    return false;
  });

  if (!config) return null;

  const value = payload[dataKey];
  const isCritical = value < config.criticalLow || value > config.criticalHigh;

  if (isCritical) {
    return (
      <circle cx={cx} cy={cy} r={4} stroke="none" fill="#ef4444" />
    );
  }

  return <circle cx={cx} cy={cy} r={2} stroke="none" fill="#10b981" />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const timestamp = payload[0].payload.timestamp;
    return (
      <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
          {format(new Date(timestamp), 'MMM dd, HH:mm:ss')}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold text-slate-600">{entry.name}:</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                {entry.value.toFixed(entry.name === 'Temperature' ? 1 : 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const VitalChart: React.FC<VitalChartProps> = ({ readings }) => {
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [left, setLeft] = useState<string | number>('dataMin');
  const [right, setRight] = useState<string | number>('dataMax');

  const chartData = readings.map(r => ({
    ...r,
    formattedTime: format(new Date(r.timestamp), 'HH:mm'),
  }));

  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    // Ensure left is before right
    let [l, r] = [refAreaLeft, refAreaRight];
    if (l > r) [l, r] = [r, l];

    setLeft(l);
    setRight(r);
    setRefAreaLeft('');
    setRefAreaRight('');
  };

  const zoomOut = () => {
    setLeft('dataMin');
    setRight('dataMax');
    setRefAreaLeft('');
    setRefAreaRight('');
  };

  const hasHR = readings.some(r => r.heartRate !== undefined);
  const hasSBP = readings.some(r => r.systolicBP !== undefined);
  const hasDBP = readings.some(r => r.diastolicBP !== undefined);
  const hasSpO2 = readings.some(r => r.spo2 !== undefined);
  const hasTemp = readings.some(r => r.temperature !== undefined);

  return (
    <div className="w-full h-[500px] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Vital Sign Trends</h3>
            {left !== 'dataMin' && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ZoomIn className="w-3 h-3" />
                Zoomed
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
            <span className="text-emerald-500">● Normal</span>
            <span className="ml-3 text-rose-500">● Critical</span>
            <span className="ml-3 text-slate-300 italic">Drag on chart to zoom</span>
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-end max-w-[400px]">
            {hasHR && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">HR</span>
              </div>
            )}
            {hasSBP && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sys BP</span>
              </div>
            )}
            {hasDBP && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-300" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Dia BP</span>
              </div>
            )}
            {hasSpO2 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">SpO2</span>
              </div>
            )}
            {hasTemp && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Temp</span>
              </div>
            )}
          </div>
          {left !== 'dataMin' && (
            <button 
              onClick={zoomOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Zoom
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
            onMouseDown={(e) => e && setRefAreaLeft(e.activeLabel || '')}
            onMouseMove={(e) => e && refAreaLeft && setRefAreaRight(e.activeLabel || '')}
            onMouseUp={zoom}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedTime" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              minTickGap={30}
              domain={[left, right]}
              allowDataOverflow
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            />
            <YAxis 
              yAxisId="temp"
              orientation="right"
              domain={[34, 42]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#f59e0b', fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} />
            {hasHR && (
              <Line 
                type="monotone" 
                dataKey="heartRate" 
                name="Heart Rate"
                stroke="#10b981" 
                strokeWidth={2} 
                dot={<CustomDot />}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={300}
              />
            )}
            {hasSBP && (
              <Line 
                type="monotone" 
                dataKey="systolicBP" 
                name="Systolic BP"
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={<CustomDot />}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={300}
              />
            )}
            {hasDBP && (
              <Line 
                type="monotone" 
                dataKey="diastolicBP" 
                name="Diastolic BP"
                stroke="#60a5fa" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={<CustomDot />}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={300}
              />
            )}
            {hasSpO2 && (
              <Line 
                type="monotone" 
                dataKey="spo2" 
                name="SpO2"
                stroke="#8b5cf6" 
                strokeWidth={2} 
                dot={<CustomDot />}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={300}
              />
            )}
            {hasTemp && (
              <Line 
                type="monotone" 
                dataKey="temperature" 
                name="Temperature"
                stroke="#f59e0b" 
                strokeWidth={2} 
                dot={<CustomDot />}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={300}
                yAxisId="temp"
              />
            )}

            {refAreaLeft && refAreaRight ? (
              <ReferenceArea 
                {...({
                  x1: refAreaLeft,
                  x2: refAreaRight,
                  fill: "#3b82f6",
                  fillOpacity: 0.1,
                  strokeOpacity: 0.3
                } as any)}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
