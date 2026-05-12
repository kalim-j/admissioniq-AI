'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { 
  History as HistoryIcon, MapPin, Sparkles, 
  ChevronRight, Calendar, Award, BookOpen, 
  Search, X, FileDown, Target, Zap, Loader2
} from "lucide-react";
import { generatePDFReport } from '@/lib/generateReport';
import { cn } from "@/lib/utils";

interface CollegeResult {
  name: string;
  location: string;
  state?: string;
  type: string;
  level: string;
  courses: string[];
  cutoff_mark: number;
  match_score: number;
  why_fit: string;
  naac_grade: string;
  nirf_rank: number;
}

interface Session {
  id: string;
  createdAt: string;
  topCollege: string;
  totalResults: number;
  studentProfile: {
    level: string;
    stream: string;
    state: string;
    district: string;
    cutoffMark: number;
    cutoffRange: string;
    budget: string;
    quota: string;
  };
  results: CollegeResult[];
}

export default function HistoryPage() {
  const { user, loading, profile } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'interviews', user.uid, 'sessions'),
          orderBy('timestamp', 'desc')
        );
        const snap = await getDocs(q);
        const data: Session[] = snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Session, 'id'>),
        }));
        setSessions(data);
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleCollegeClick = (college: CollegeResult) => {
    const resultsToStore = sessions.find(s => s.results.some(r => r.name === college.name))?.results;
    if (resultsToStore) {
        sessionStorage.setItem('eduanalytics_results', JSON.stringify(resultsToStore));
    }
    const slug = college.name.toLowerCase().replace(/ /g, "-");
    router.push(`/colleges/${slug}`);
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Retrieving analysis history…</p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-[#05071a] flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-lg">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
            <div className="h-24 w-24 bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex items-center justify-center text-white/20 mx-auto relative z-10">
              <HistoryIcon size={40} />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-white tracking-tighter">No History Found</h2>
            <p className="text-white/40 font-medium text-sm leading-relaxed">
              You haven't performed any AI college analyses yet. Start your journey by completing the matching wizard.
            </p>
          </div>
          <button 
            onClick={() => router.push('/interview')} 
            className="btn-primary h-16 px-10 text-base group"
          >
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            Start First AI Analysis
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 py-16 max-w-5xl relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 border-b border-white/5 pb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <HistoryIcon size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">User Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Analysis History</h1>
            <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Revisit your previous AI college recommendations</p>
          </div>
          <button 
            onClick={() => router.push('/interview')}
            className="h-14 px-8 bg-white/[0.05] border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/[0.1] transition-all flex items-center gap-2"
          >
            <Zap size={14} /> New Analysis
          </button>
        </header>

        <div className="space-y-6 pb-24">
          {sessions.map((session, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              key={session.id}
            >
              <div className={cn(
                "rounded-[2.5rem] border transition-all overflow-hidden bg-white/[0.02] backdrop-blur-xl group",
                expandedId === session.id ? "border-indigo-500/40 bg-white/[0.04]" : "border-white/5 hover:border-white/20"
              )}>
                <div className="p-10">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                    <div className="space-y-6 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-indigo-500/10 rounded-lg text-[9px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                          {session.studentProfile?.level || "UG"}
                        </span>
                        <span className="px-3 py-1 bg-teal-500/10 rounded-lg text-[9px] font-black text-teal-400 uppercase tracking-widest border border-teal-500/20">
                          {session.studentProfile?.stream || "Engineering"}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black text-white leading-tight tracking-tight group-hover:text-indigo-400 transition-colors">
                          {session.topCollege}
                        </h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          <div className="flex items-center gap-2 text-[11px] text-white/30 font-black uppercase tracking-widest">
                            <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                            {session.studentProfile?.district}, {session.studentProfile?.state}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-white/30 font-black uppercase tracking-widest">
                            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                            {session.createdAt ? new Date(session.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            }) : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 w-fit">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Cutoff Score</p>
                          <p className="text-lg font-black text-white">{session.studentProfile?.cutoffMark}</p>
                        </div>
                        <div className="w-px h-10 bg-white/5" />
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Category</p>
                          <p className="text-lg font-black text-white">{session.studentProfile?.quota}</p>
                        </div>
                        <div className="w-px h-10 bg-white/5" />
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Matches Found</p>
                          <p className="text-lg font-black text-teal-400">{session.totalResults}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full lg:w-auto">
                      <button
                        onClick={() => {
                          const mappedResults = session.results.map(r => ({
                            name: r.name,
                            location: r.location,
                            state: r.state || r.location.split(',').pop()?.trim() || 'India',
                            cutoff_general: r.cutoff_mark,
                            match_score: r.match_score,
                            why_fit: r.why_fit,
                            naac_grade: r.naac_grade,
                            nirf_rank: r.nirf_rank
                          }));

                          generatePDFReport({
                            studentName: profile?.fullName || 'Student',
                            marks: session.studentProfile?.cutoffMark || 0,
                            category: session.studentProfile?.quota || 'General',
                            course: session.studentProfile?.stream || 'Any',
                            aiSummary: `Based on your academic profile with ${session.studentProfile?.cutoffMark} marks in ${session.studentProfile?.stream}, we have analyzed ${session.results.length} colleges that best match your preferences. Focus on high-match-score institutions for optimized admission probability.`,
                            safeColleges: mappedResults.filter(c => (c.match_score || 0) > 80),
                            moderateColleges: mappedResults.filter(c => (c.match_score || 0) > 60 && (c.match_score || 0) <= 80),
                            reachColleges: mappedResults.filter(c => (c.match_score || 0) <= 60),
                          });
                        }}
                        className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white transition-all shadow-xl shadow-teal-500/5 flex items-center justify-center gap-2"
                      >
                        <FileDown size={16} /> Download Intelligence
                      </button>
                      <button
                        onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                        className={cn(
                          "h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-2",
                          expandedId === session.id 
                              ? "bg-white text-[#05071a]" 
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                        )}
                      >
                        {expandedId === session.id ? (
                            <><X size={16} /> Close Results</>
                        ) : (
                            <><Search size={16} /> Reveal Analysis</>
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === session.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-12 space-y-6">
                          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">AI Selected Institutions</p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            {session.results.map((college, idx) => (
                              <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.05, duration: 0.4 }}
                                key={idx}
                                onClick={() => handleCollegeClick(college)}
                                className="group p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
                              >
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex gap-6 items-center flex-1">
                                  <div className="h-14 w-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center font-black text-white/20 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all text-xl">
                                      {idx + 1}
                                  </div>
                                  <div className="space-y-1">
                                      <h4 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight leading-tight">{college.name}</h4>
                                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={10} className="text-indigo-500" /> {college.location} · NAAC: {college.naac_grade}
                                      </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                  <div className="text-right">
                                      <div className={cn(
                                        "text-2xl font-black",
                                        college.match_score > 80 ? "text-teal-400" : college.match_score > 60 ? "text-amber-400" : "text-red-400"
                                      )}>{Math.round(college.match_score)}%</div>
                                      <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Match Score</div>
                                  </div>
                                  <div className="h-12 w-12 rounded-2xl bg-white/[0.05] border border-white/10 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all text-white/20">
                                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
