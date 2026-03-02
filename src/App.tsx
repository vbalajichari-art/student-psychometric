/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  ClipboardList, 
  BarChart3, 
  QrCode, 
  Plus, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  Lightbulb, 
  BookOpen, 
  Download, 
  Upload,
  Scan,
  Copy,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { 
  Cohort, 
  Survey, 
  Response, 
  DimensionId, 
  AnalysisResult, 
  PedagogicalStrategy 
} from './types';
import { DIMENSIONS, DEFAULT_QUESTIONS, LEVELS } from './constants';
import { analyzeResponses, getStrategies, getAssignmentRecommendations } from './analysis';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Card = ({ children, className, onClick, ...props }: any) => (
  <div 
    {...props}
    onClick={onClick}
    className={cn(
      "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden",
      onClick && "cursor-pointer hover:border-indigo-300 transition-colors",
      className
    )}
  >
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  onClick, 
  disabled,
  icon: Icon,
  ...props
}: any) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-slate-800 text-white hover:bg-slate-900",
    outline: "bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
  };

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'faculty' | 'student' | 'cohort_detail' | 'survey_taking' | 'scan'>('landing');
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [activeCohortId, setActiveCohortId] = useState<string | null>(null);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResponseQR, setShowResponseQR] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isBulkScan, setIsBulkScan] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('cohortmind_data');
    if (saved) {
      try {
        setCohorts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cohortmind_data', JSON.stringify(cohorts));
  }, [cohorts]);

  // Actions
  const createCohort = () => {
    const name = prompt("Enter Cohort Name (e.g., CS101 Spring 2026):");
    if (!name) return;
    const newCohort: Cohort = {
      id: crypto.randomUUID(),
      name,
      responses: []
    };
    setCohorts([...cohorts, newCohort]);
  };

  const deleteCohort = (id: string) => {
    if (confirm("Are you sure? All data for this cohort will be lost.")) {
      setCohorts(cohorts.filter(c => c.id !== id));
      if (activeCohortId === id) setView('faculty');
    }
  };

  const startSurvey = () => {
    // For demo, we use default survey
    const survey: Survey = {
      id: 'default_survey',
      title: 'Learner Profile Survey',
      description: 'Help us understand how you learn best.',
      questions: DEFAULT_QUESTIONS,
      createdAt: Date.now()
    };
    setActiveSurvey(survey);
    setView('survey_taking');
    setStudentAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (value: number) => {
    if (!activeSurvey) return;
    const q = activeSurvey.questions[currentQuestionIndex];
    setStudentAnswers({ ...studentAnswers, [q.id]: value });
    
    if (currentQuestionIndex < activeSurvey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResponseQR(true);
    }
  };

  const activeCohort = cohorts.find(c => c.id === activeCohortId);
  const analysisResults = activeCohort ? analyzeResponses(activeCohort.responses, DEFAULT_QUESTIONS) : [];
  const strategies = analysisResults.length > 0 ? getStrategies(analysisResults) : [];
  const assignments = analysisResults.length > 0 ? getAssignmentRecommendations(analysisResults) : [];

  // QR Scanning Logic
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  useEffect(() => {
    if (view === 'scan' && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scannerRef.current.render((decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.type === 'cohortmind_response' && activeCohortId) {
            const response: Response = {
              id: crypto.randomUUID(),
              surveyId: data.surveyId,
              timestamp: Date.now(),
              answers: data.answers
            };
            setCohorts(prev => prev.map(c => 
              c.id === activeCohortId 
                ? { ...c, responses: [...c.responses, response] }
                : c
            ));
            setScanResult("Response added successfully!");
            
            if (!isBulkScan) {
              if (scannerRef.current) scannerRef.current.clear();
              setTimeout(() => {
                setView('cohort_detail');
                setScanResult(null);
                scannerRef.current = null;
              }, 1500);
            } else {
              setTimeout(() => setScanResult(null), 1000);
            }
          }
        } catch (e) {
          console.error("Invalid QR data", e);
        }
      }, (err) => {
        // console.warn(err);
      });
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
        scannerRef.current = null;
      }
    };
  }, [view, activeCohortId]);

  // Export
  const exportData = () => {
    const blob = new Blob([JSON.stringify(cohorts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohortmind_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        // Support both full export and single response
        if (Array.isArray(imported)) {
          if (confirm("This will replace all current cohorts. Continue?")) {
            setCohorts(imported);
            alert("Full backup restored successfully!");
          }
        } else if (imported.type === 'cohortmind_response') {
          if (activeCohortId) {
            const response: Response = {
              id: crypto.randomUUID(),
              surveyId: imported.surveyId,
              timestamp: Date.now(),
              answers: imported.answers
            };
            setCohorts(prev => prev.map(c => 
              c.id === activeCohortId 
                ? { ...c, responses: [...c.responses, response] }
                : c
            ));
            alert("Response added to current cohort!");
          } else {
            alert("To import a single response, please open a specific cohort first.");
          }
        } else {
          alert("Unrecognized JSON format.");
        }
      } catch (err) {
        alert("Invalid JSON file.");
      }
      // Reset input
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const pasteResponses = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      if (data.type === 'cohortmind_response' && activeCohortId) {
        const response: Response = {
          id: crypto.randomUUID(),
          surveyId: data.surveyId,
          timestamp: Date.now(),
          answers: data.answers
        };
        setCohorts(prev => prev.map(c => 
          c.id === activeCohortId 
            ? { ...c, responses: [...c.responses, response] }
            : c
        ));
        alert("Response pasted successfully!");
      } else {
        alert("Clipboard does not contain a valid response code.");
      }
    } catch (err) {
      alert("Failed to read clipboard or invalid data.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-bottom border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2" onClick={() => setView('landing')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
            <Users size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">CohortMind</span>
        </div>
        {view !== 'landing' && (
          <Button variant="ghost" className="p-2" onClick={() => setView('landing')}>
            <X size={20} />
          </Button>
        )}
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {/* LANDING VIEW */}
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3 pt-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                  Know Your <span className="text-indigo-600">Cohort.</span>
                </h1>
                <p className="text-slate-500 text-lg">
                  Psychometrically grounded learner profiling for higher education faculty.
                </p>
              </div>

              <div className="grid gap-4">
                <Card 
                  onClick={() => setView('faculty')}
                  className="p-6 border-l-4 border-l-indigo-600 hover:bg-indigo-50/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Faculty Portal</h3>
                      <p className="text-sm text-slate-500">Manage cohorts and analyze data.</p>
                    </div>
                    <ChevronRight className="ml-auto text-slate-300" />
                  </div>
                </Card>

                <Card 
                  onClick={startSurvey}
                  className="p-6 border-l-4 border-l-emerald-600 hover:bg-emerald-50/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Student Mode</h3>
                      <p className="text-sm text-slate-500">Answer survey and share response.</p>
                    </div>
                    <ChevronRight className="ml-auto text-slate-300" />
                  </div>
                </Card>
              </div>

              <div className="pt-8 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Frameworks Used</h4>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['Biggs Deep/Surface', 'UDL', 'SDT', 'Kolb Experiential', 'Vygotsky Social'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-4 text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-6">
                  <p>
                    <span className="font-bold uppercase">References:</span> Grounded in Self-Determination Theory (Deci & Ryan), Deep Learning (Biggs), and Cognitive Load Theory (Sweller).
                  </p>
                  <p>
                    <span className="font-bold uppercase">Disclaimer:</span> This tool is intended for conceptual aid and pedagogical decision support. It is not a clinical diagnostic tool. A professional educator or learning scientist should be consulted for critical instructional decisions.
                  </p>
                  <p className="font-medium text-slate-500 pt-2">
                    © 2026 Balaji Venkatachary, All Rights Reserved.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* FACULTY VIEW */}
          {view === 'faculty' && (
            <motion.div 
              key="faculty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Cohorts</h2>
                <Button variant="outline" icon={Plus} onClick={createCohort}>New</Button>
              </div>

              {cohorts.length === 0 ? (
                <div className="text-center py-12 px-6 bg-white rounded-2xl border border-dashed border-slate-300">
                  <Users className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500">No cohorts yet. Create one to start collecting data.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {cohorts.map(cohort => (
                    <Card 
                      key={cohort.id} 
                      onClick={() => {
                        setActiveCohortId(cohort.id);
                        setView('cohort_detail');
                      }}
                      className="p-4 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold">
                        {cohort.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold">{cohort.name}</h4>
                        <p className="text-xs text-slate-500">{cohort.responses.length} responses collected</p>
                      </div>
                      <ChevronRight className="ml-auto text-slate-300" />
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" icon={Download} onClick={exportData}>Backup All</Button>
                <Button variant="ghost" className="flex-1" icon={Upload} onClick={() => fileInputRef.current?.click()}>Restore Backup</Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={importJson} 
                />
              </div>
            </motion.div>
          )}

          {/* COHORT DETAIL */}
          {view === 'cohort_detail' && activeCohort && (
            <motion.div 
              key="cohort_detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="p-2" onClick={() => setView('faculty')}>
                  <ArrowLeft size={20} />
                </Button>
                <h2 className="text-xl font-bold truncate">{activeCohort.name}</h2>
                <Button variant="danger" className="ml-auto p-2" onClick={() => deleteCohort(activeCohort.id)}>
                  <X size={18} />
                </Button>
              </div>

              {activeCohort.responses.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <Scan size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">No Data Collected</h3>
                    <p className="text-slate-500 text-sm">Scan student response QRs to build the profile.</p>
                  </div>
                  <Button icon={Scan} onClick={() => setView('scan')}>Start Scanning</Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Faculty Warning Layer */}
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
                    <Info className="text-amber-600 shrink-0" size={20} />
                    <p className="text-xs text-amber-800 font-medium">
                      <span className="font-bold uppercase block mb-1">Faculty Guidance</span>
                      These are cohort-level indicators and probabilistic tendencies, not fixed learner identities or deterministic labels.
                    </p>
                  </div>

                  {/* Radar Chart */}
                  <Card className="p-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Cohort Profile Radar</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysisResults}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="dimensionId" tick={{ fontSize: 8, fill: '#64748b' }} />
                          <Radar
                            name="Cohort"
                            dataKey="score"
                            stroke="#4f46e5"
                            fill="#4f46e5"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Hierarchical Insights */}
                  <div className="space-y-8">
                    {LEVELS.map(level => (
                      <div key={level.id} className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 border-b border-slate-200 pb-2">
                          {level.label}
                        </h3>
                        <div className="grid gap-4">
                          {level.dimensions.map(dimId => {
                            const res = analysisResults.find(r => r.dimensionId === dimId);
                            const dim = DIMENSIONS.find(d => d.id === dimId);
                            if (!res || !dim) return null;
                            return (
                              <Card key={dimId} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-slate-800">{dim.label}</h4>
                                    <p className="text-[10px] text-slate-500 italic">{dim.framework}</p>
                                  </div>
                                  <span className="text-xl font-black text-indigo-600">{res.score}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-indigo-600 h-full transition-all duration-1000" 
                                    style={{ width: `${res.score}%` }} 
                                  />
                                </div>
                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter text-slate-400">
                                  <span>{dim.lowLabel}</span>
                                  <span>{dim.highLabel}</span>
                                </div>
                                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                  {res.interpretation}
                                </p>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Strategies */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Lightbulb size={20} className="text-amber-500" />
                      Pedagogical Strategies
                    </h3>
                    {strategies.map((strat, i) => (
                      <Card key={i} className="p-4 border-l-4 border-l-amber-500">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-800">{strat.title}</h4>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                            strat.impact === 'high' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {strat.impact} Impact
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{strat.description}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <BookOpen size={12} />
                          {strat.theory}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Assignments */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <ClipboardList size={20} className="text-emerald-500" />
                      Assignment Recommendations
                    </h3>
                    {assignments.map((assign, i) => (
                      <Card key={i} className="p-4 border-l-4 border-l-emerald-500">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-800">{assign.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-600">
                            {assign.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{assign.description}</p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="block text-[10px] uppercase text-slate-400 font-bold">Scaffolding</span>
                            <span className="text-xs font-medium">{assign.scaffolding}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="block text-[10px] uppercase text-slate-400 font-bold">Cognitive Level</span>
                            <span className="text-xs font-medium">{assign.cognitiveLevel}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <BookOpen size={12} />
                          {assign.theory}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button className="flex-1" icon={Scan} onClick={() => setView('scan')}>Scan QR</Button>
                      <Button variant="outline" className="flex-1" icon={Copy} onClick={pasteResponses}>Paste Code</Button>
                    </div>
                    <Button variant="ghost" className="w-full" icon={Upload} onClick={() => fileInputRef.current?.click()}>Import Response File</Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* SCAN VIEW */}
          {view === 'scan' && (
            <motion.div 
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" className="p-2" onClick={() => setView('cohort_detail')}>
                    <ArrowLeft size={20} />
                  </Button>
                  <h2 className="text-xl font-bold">Scan Response</h2>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Bulk Mode</span>
                  <button 
                    onClick={() => setIsBulkScan(!isBulkScan)}
                    className={clsx(
                      "w-8 h-4 rounded-full transition-colors relative",
                      isBulkScan ? "bg-indigo-600" : "bg-slate-300"
                    )}
                  >
                    <div className={clsx(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                      isBulkScan ? "left-4.5" : "left-0.5"
                    )} />
                  </button>
                </div>
              </div>

              <div className="bg-black rounded-2xl overflow-hidden aspect-square relative border-4 border-indigo-600">
                <div id="qr-reader" className="w-full h-full"></div>
                {scanResult && (
                  <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in zoom-in">
                    <CheckCircle2 size={64} className="mb-4" />
                    <h3 className="text-2xl font-bold">{scanResult}</h3>
                    {isBulkScan && <p className="text-sm mt-2">Ready for next scan...</p>}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-indigo-50 p-4 rounded-xl flex gap-3 items-start border border-indigo-100">
                  <Info className="text-indigo-600 shrink-0" size={20} />
                  <p className="text-sm text-indigo-800">
                    Position the student's response QR code within the frame. Data is processed locally and anonymously.
                  </p>
                </div>
                {isBulkScan && (
                  <Button className="w-full" onClick={() => setView('cohort_detail')}>Done Scanning</Button>
                )}
              </div>
            </motion.div>
          )}

          {/* SURVEY TAKING */}
          {view === 'survey_taking' && activeSurvey && (
            <motion.div 
              key="survey_taking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {!showResponseQR ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Question {currentQuestionIndex + 1} of {activeSurvey.questions.length}</span>
                      <span>{Math.round(((currentQuestionIndex + 1) / activeSurvey.questions.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full transition-all" 
                        style={{ width: `${((currentQuestionIndex + 1) / activeSurvey.questions.length) * 100}%` }} 
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <h2 className="text-2xl font-bold leading-tight text-slate-800">
                      {activeSurvey.questions[currentQuestionIndex].text}
                    </h2>
                    
                    <div className="grid gap-3">
                      {[
                        { label: 'Strongly Disagree', val: 1 },
                        { label: 'Disagree', val: 2 },
                        { label: 'Neutral', val: 3 },
                        { label: 'Agree', val: 4 },
                        { label: 'Strongly Agree', val: 5 },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => handleAnswer(opt.val)}
                          className="w-full p-4 text-left rounded-2xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-medium flex items-center justify-between group"
                        >
                          {opt.label}
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
                        </button>
                      ))}
                    </div>

                    {currentQuestionIndex > 0 && (
                      <Button variant="ghost" className="w-full" onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}>
                        <ArrowLeft size={18} className="mr-2" />
                        Previous Question
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center space-y-8 py-8">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Survey Complete!</h2>
                    <p className="text-slate-500">Present this QR code to your instructor to share your anonymous profile.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-xl inline-block border border-slate-100">
                      <QRCodeSVG 
                        value={JSON.stringify({
                          type: 'cohortmind_response',
                          surveyId: activeSurvey.id,
                          answers: studentAnswers
                        })} 
                        size={240}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                      <Button 
                        variant="outline" 
                        icon={Copy}
                        onClick={() => {
                          const data = JSON.stringify({
                            type: 'cohortmind_response',
                            surveyId: activeSurvey.id,
                            answers: studentAnswers
                          });
                          navigator.clipboard.writeText(data);
                          alert("Response code copied to clipboard!");
                        }}
                      >
                        Copy Response Code
                      </Button>
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setView('landing');
                          setStudentAnswers({});
                          setShowResponseQR(false);
                        }}
                      >
                        Finish
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar (Mobile) */}
      {view !== 'landing' && view !== 'survey_taking' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 pb-8 flex justify-around items-center z-40">
          <button 
            onClick={() => setView('faculty')}
            className={cn("flex flex-col items-center gap-1", view === 'faculty' || view === 'cohort_detail' ? "text-indigo-600" : "text-slate-400")}
          >
            <Users size={24} />
            <span className="text-[10px] font-bold uppercase">Faculty</span>
          </button>
          <button 
            onClick={startSurvey}
            className={cn("flex flex-col items-center gap-1", view === 'survey_taking' ? "text-indigo-600" : "text-slate-400")}
          >
            <ClipboardList size={24} />
            <span className="text-[10px] font-bold uppercase">Student</span>
          </button>
        </nav>
      )}
    </div>
  );
}
