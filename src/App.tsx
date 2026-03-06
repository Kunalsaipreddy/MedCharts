import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  User, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  RefreshCw,
  Stethoscope,
  LayoutDashboard,
  History,
  Settings
} from 'lucide-react';
import { Github, LogOut } from 'lucide-react';
import { VitalReading } from './types';
import { CSVUploader } from './components/CSVUploader';
import { VitalCard } from './components/VitalCard';
import { VitalChart } from './components/VitalChart';
import { HistoryTable } from './components/HistoryTable';
import { AlertPanel } from './components/AlertPanel';
import { ChatBot } from './components/ChatBot';
import { analyzeVitals } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [readings, setReadings] = useState<VitalReading[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [user, setUser] = useState<{ name: string; avatar: string; login: string } | null>(null);

  const handleGitHubLogin = async () => {
    try {
      const response = await fetch('/api/auth/github/url');
      const { url } = await response.json();
      window.open(url, 'github_oauth', 'width=600,height=700');
    } catch (error) {
      console.error('Failed to get GitHub auth URL:', error);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setUser(event.data.user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleDataLoaded = (data: VitalReading[]) => {
    setReadings(data);
    setSelectedIndex(data.length - 1);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    if (readings.length > 0) {
      const runAnalysis = async () => {
        setIsAnalyzing(true);
        const result = await analyzeVitals(readings);
        setAnalysis(result);
        setIsAnalyzing(false);
      };
      runAnalysis();
    }
  }, [readings]);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">MedChart</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
            <History className="w-4 h-4" />
            Patient History
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                {user ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{user ? user.name : 'Nurse Sarah J.'}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase">{user ? `@${user.login}` : 'Ward 4B • ICU'}</p>
              </div>
            </div>
            {user && (
              <button 
                onClick={() => setUser(null)}
                className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                Live Monitor
              </div>
              <h1 className="text-lg font-bold text-slate-900">
                Patient: {readings[selectedIndex]?.patientName || 'John Doe'} 
                {readings[selectedIndex]?.patientId && ` (ID: ${readings[selectedIndex].patientId})`}
              </h1>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">
                Last Sync: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!user && (
              <button 
                onClick={handleGitHubLogin}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all"
              >
                <Github className="w-4 h-4" />
                Sign in with GitHub
              </button>
            )}
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw className={isAnalyzing ? "animate-spin" : ""} />
            </button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-800 transition-all">
              Export Report
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 clinical-grid">
          <AnimatePresence mode="wait">
            {readings.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex items-center justify-center"
              >
                <CSVUploader onDataLoaded={handleDataLoaded} />
              </motion.div>
            ) : (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto space-y-6"
              >
                {/* AI Insights Banner */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <Stethoscope className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Clinical AI Analysis</span>
                      </div>
                      
                      {isAnalyzing ? (
                        <div className="space-y-3 animate-pulse">
                          <div className="h-4 bg-white/10 rounded w-3/4" />
                          <div className="h-4 bg-white/10 rounded w-1/2" />
                        </div>
                      ) : (
                        <>
                          <h2 className="text-2xl font-semibold mb-4 leading-tight">
                            {analysis?.summary || "Analyzing patient trends..."}
                          </h2>
                          <div className="flex flex-wrap gap-3">
                            {analysis?.alerts?.map((alert: any, i: number) => (
                              <div key={i} className={cn(
                                "flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs font-bold uppercase tracking-tight",
                                alert.severity === 'critical' 
                                  ? "bg-rose-500/20 border-rose-500/30 text-rose-200" 
                                  : "bg-amber-500/20 border-amber-500/30 text-amber-200"
                              )}>
                                <ShieldAlert className="w-3 h-3" />
                                {alert.issue}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">Actionable Recommendation</span>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {analysis?.recommendation || "Awaiting data analysis..."}
                      </p>
                    </div>
                    <button className="mt-6 flex items-center justify-between w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-900 text-sm font-bold transition-colors">
                      View Protocol
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <VitalCard type="heartRate" readings={readings.slice(0, selectedIndex + 1)} />
                  <VitalCard type="bp" readings={readings.slice(0, selectedIndex + 1)} />
                  <VitalCard type="spo2" readings={readings.slice(0, selectedIndex + 1)} />
                  <VitalCard type="temperature" readings={readings.slice(0, selectedIndex + 1)} />
                </div>

                {/* Main Chart */}
                <VitalChart readings={readings} />

                {/* Alerts and History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <AlertPanel readings={readings} aiAlerts={analysis?.alerts} />
                  </div>
                  <div className="lg:col-span-2">
                    <HistoryTable 
                      readings={readings} 
                      selectedIndex={selectedIndex} 
                      onSelect={setSelectedIndex} 
                    />
                  </div>
                </div>

                {/* Data Reset */}
                <div className="flex justify-center pt-8">
                  <button 
                    onClick={() => setReadings([])}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                  >
                    Clear Data & Upload New File
                  </button>
                </div>

                {/* AI Chatbot */}
                <ChatBot readings={readings} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
