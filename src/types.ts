export interface VitalReading {
  timestamp: string;
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  spo2?: number;
  temperature?: number;
  patientId?: string | number;
  patientName?: string;
}

export interface PatientData {
  id: string;
  name: string;
  age: number;
  room: string;
  readings: VitalReading[];
}

export type VitalType = 'heartRate' | 'bp' | 'spo2' | 'temperature';

export interface VitalConfig {
  label: string;
  unit: string;
  color: string;
  min: number;
  max: number;
  criticalLow: number;
  criticalHigh: number;
  normalLow: number;
  normalHigh: number;
}

export const VITAL_CONFIGS: Record<VitalType, VitalConfig> = {
  heartRate: {
    label: 'Heart Rate',
    unit: 'bpm',
    color: '#10b981', // emerald-500 (default green)
    min: 40,
    max: 180,
    criticalLow: 50,
    criticalHigh: 120,
    normalLow: 60,
    normalHigh: 100,
  },
  bp: {
    label: 'Systolic BP',
    unit: 'mmHg',
    color: '#10b981', // emerald-500
    min: 60,
    max: 200,
    criticalLow: 80,
    criticalHigh: 160,
    normalLow: 90,
    normalHigh: 120,
  },
  spo2: {
    label: 'SpO2',
    unit: '%',
    color: '#10b981', // emerald-500
    min: 80,
    max: 100,
    criticalLow: 90, // Defaulting to 90 if not specified, but user didn't give SpO2 criticals in the prompt text, only HR, BP, Temp.
    criticalHigh: 101,
    normalLow: 95,
    normalHigh: 100,
  },
  temperature: {
    label: 'Temperature',
    unit: '°C',
    color: '#10b981', // emerald-500
    min: 34,
    max: 42,
    criticalLow: 35.0,
    criticalHigh: 38.5,
    normalLow: 36.1,
    normalHigh: 37.2,
  },
};
