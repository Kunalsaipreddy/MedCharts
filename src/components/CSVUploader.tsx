import React, { useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { VitalReading } from '../types';

interface CSVUploaderProps {
  onDataLoaded: (data: VitalReading[]) => void;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const processFile = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const findValue = (row: any, keys: string[]) => {
          const foundKey = Object.keys(row).find(k => 
            keys.some(key => k.toLowerCase() === key.toLowerCase())
          );
          return foundKey ? row[foundKey] : undefined;
        };

        const parseNum = (val: any): number | undefined => {
          if (val === undefined || val === null || val === '') return undefined;
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        };

        const readings: VitalReading[] = results.data
          .map((row: any) => {
            const timestamp = findValue(row, ['timestamp', 'time', 'date']);
            const hr = findValue(row, ['heart_rate', 'heartRate', 'hr', 'bpm']);
            const sbp = findValue(row, ['systolic_bp', 'systolicBP', 'sbp', 'systolic']);
            const temp = findValue(row, ['temperature', 'temp', 't']);
            
            // Optional/Other fields (keep for compatibility but prioritize the requested ones)
            const dbp = findValue(row, ['diastolic_bp', 'diastolicBP', 'dbp', 'diastolic']);
            const spo2 = findValue(row, ['spo2', 'oximetry', 'sat']);
            const pId = findValue(row, ['patient_id', 'patientId', 'pid']);
            const pName = findValue(row, ['patient_name', 'patientName', 'name']);

            // Only include if at least some data is present
            if (!timestamp && !hr && !sbp && !temp) return null;

            return {
              timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
              heartRate: parseNum(hr),
              systolicBP: parseNum(sbp),
              diastolicBP: parseNum(dbp),
              spo2: parseNum(spo2),
              temperature: parseNum(temp),
              patientId: pId as string | number | undefined,
              patientName: pName as string | undefined,
            } as VitalReading;
          })
          .filter((r): r is VitalReading => r !== null)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        if (readings.length > 0) {
          onDataLoaded(readings);
        } else {
          alert("No valid vital sign data found in CSV. Please ensure your CSV has recognizable headers like 'Time', 'HR', 'BP', etc.");
        }
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
        alert("Failed to parse CSV file. Please ensure it is a valid CSV format.");
      }
    });
  }, [onDataLoaded]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "text/csv") {
      processFile(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const loadSampleData = () => {
    const now = new Date();
    const sample: VitalReading[] = Array.from({ length: 24 }).map((_, i) => {
      const time = new Date(now.getTime() - (23 - i) * 15 * 60 * 1000);
      
      // Inject some critical readings for testing
      let hr = 70 + Math.random() * 20;
      let sbp = 110 + Math.random() * 20;
      let temp = 36.5 + Math.random() * 0.5;

      if (i === 10) hr = 45; // Critical Low HR
      if (i === 15) sbp = 175; // Critical High SBP
      if (i === 18) temp = 39.2; // Critical High Temp
      
      let spo2 = 98 - (i > 20 ? (i - 20) * 1.5 : Math.random());
      if (i === 22) spo2 = 88; // Critical Low SpO2

      return {
        timestamp: time.toISOString(),
        heartRate: hr,
        systolicBP: sbp,
        diastolicBP: 80 + Math.random() * 5,
        spo2: spo2,
        temperature: temp,
        patientName: 'John Doe',
        patientId: '44920'
      } as VitalReading;
    });
    onDataLoaded(sample);
  };

  const downloadTemplate = () => {
    const headers = ['timestamp', 'heart_rate', 'systolic_bp', 'temperature'];
    const rows = [
      [new Date().toISOString(), 72, 120, 36.6],
      [new Date(Date.now() - 3600000).toISOString(), 75, 122, 36.7]
    ];
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "vitals_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all duration-300 group max-w-xl w-full ${
        isDragging 
          ? "border-slate-900 bg-slate-50 scale-[1.02]" 
          : "border-slate-200 bg-white/50 hover:bg-white hover:border-slate-300"
      }`}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
        isDragging ? "bg-slate-900 text-white rotate-12" : "bg-slate-100 text-slate-500 group-hover:scale-110"
      }`}>
        <Upload className="w-8 h-8" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-2">Ingest Monitor Data</h3>
      <p className="text-sm text-slate-500 mb-8 text-center max-w-sm leading-relaxed">
        Drag and drop your monitor CSV export here, or use the buttons below to select a file or load clinical sample data.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full px-8 mb-4">
        <label className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-slate-800 transition-all text-sm font-bold shadow-lg shadow-slate-200">
          <FileText className="w-4 h-4" />
          Choose File
          <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </label>
        
        <button 
          onClick={loadSampleData}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold"
        >
          <AlertCircle className="w-4 h-4" />
          Load Sample
        </button>
      </div>

      <button 
        onClick={downloadTemplate}
        className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors mb-2"
      >
        Download CSV Template
      </button>
      
      <div className="mt-10 pt-6 border-t border-slate-100 w-full flex justify-center gap-8">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Format</span>
          <span className="text-xs font-bold text-slate-600">CSV / Text</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Max Size</span>
          <span className="text-xs font-bold text-slate-600">10 MB</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Headers</span>
          <span className="text-xs font-bold text-slate-600">timestamp, heart_rate, systolic_bp, temperature</span>
        </div>
      </div>
    </div>
  );
};
