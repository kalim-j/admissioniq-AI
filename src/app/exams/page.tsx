"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Search, GraduationCap, Building, Calendar, 
  ExternalLink, Info, Loader2, ChevronDown, ChevronUp,
  MapPin, BookOpen, Clock, Award, Star, Filter, ArrowUpDown, 
  CheckCircle2, Lightbulb, Target, ShieldCheck, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const STREAMS = [
  "Engineering & Technology", "Medical & Health Sciences", "Science & Research",
  "Commerce & Finance", "Arts & Humanities", "Law & Legal Studies",
  "Management & Business", "Agriculture & Veterinary", "Education & Teaching"
];
const COURSE_LEVELS = ["UG", "PG"];

export default function EntranceExamGuide() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("importance");
  const [filterLevel, setFilterLevel] = useState("All");

  const [formData, setFormData] = useState({
    level: "UG",
    stream: "Engineering & Technology"
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    try {
      const response = await fetch("/api/entrance-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Exam intelligence fetch failure.");
      const data = await response.json();
      setResults(data);
      toast.success(`Discovered ${data.length} mission-critical exams!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSortedAndFilteredExams = () => {
    let filtered = results;
    if (filterLevel !== "All") {
      filtered = filtered.filter(e => e.level === filterLevel);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "importance") {
        const priority: any = { High: 0, Medium: 1, Low: 2 };
        return priority[a.importance] - priority[b.importance];
      }
      if (sortBy === "name") return a.short_name.localeCompare(b.short_name);
      return 0;
    });
  };

  const importanceColor = (imp: string) => {
    if (imp === "High") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (imp === "Medium") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  };

  const levelColor = (lvl: string) => {
    if (lvl === "National") return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    if (lvl === "State") return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-indigo-500/30 py-24">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <header className="text-center space-y-6 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4"
          >
            <Award size={14} />
            Admission Benchmarks
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400">Admissions Journey</span>
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px] max-w-lg mx-auto">
            Find every national, state, and university-level entrance benchmark required to secure your placement in elite institutions.
          </p>
        </header>

        {/* Search Engine */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl mb-16 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
             <Target size={300} className="text-indigo-500" />
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <GraduationCap size={12} className="text-indigo-500" /> Academic Level
              </label>
              <div className="relative">
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 appearance-none cursor-pointer transition-all"
                >
                  {COURSE_LEVELS.map(l => <option key={l} value={l} className="bg-[#05071a]">{l}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <BookOpen size={12} className="text-indigo-500" /> Subject Stream
              </label>
              <div className="relative">
                <select
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 appearance-none cursor-pointer transition-all"
                >
                  {STREAMS.map(s => <option key={s} value={s} className="bg-[#05071a]">{s}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="md:col-span-2 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-20 text-xl font-black group"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="group-hover:rotate-12 transition-transform" />}
                {loading ? "Analyzing Exam Repository..." : "Execute Intelligence Search"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Intelligence Filters */}
        {results.length > 0 && (
          <div className="flex flex-col xl:flex-row justify-between items-center gap-8 bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] mb-12 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-widest">
                <Filter size={14} className="text-indigo-500" /> Geographic Scope:
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["All", "National", "State", "University"].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      filterLevel === lvl 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20" 
                        : "bg-white/[0.05] border-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-widest">
                <ArrowUpDown size={14} className="text-indigo-500" /> Sequence Logic:
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/[0.05] border border-white/10 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="importance" className="bg-[#05071a]">Impact Priority</option>
                  <option value="name" className="bg-[#05071a]">Alphabetic Sequence</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
              </div>
            </div>
          </div>
        )}

        {/* Results Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {getSortedAndFilteredExams().map((exam, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-10 space-y-8 hover:border-indigo-500/30 transition-all group relative overflow-hidden backdrop-blur-md"
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                   <Award size={180} className="text-indigo-500" />
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <h3 className="text-4xl font-black text-indigo-400 tracking-tighter group-hover:text-white transition-colors leading-none">
                      {exam.short_name}
                    </h3>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg",
                      importanceColor(exam.importance)
                    )}>
                      {exam.importance} Priority
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest">{exam.name}</p>
                </div>

                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className={cn("px-4 py-1.5 border text-[9px] font-black uppercase tracking-widest rounded-lg", levelColor(exam.level))}>
                    {exam.level} Scope
                  </span>
                  <span className="px-4 py-1.5 bg-white/[0.05] border border-white/5 text-white/30 text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {exam.mode}
                  </span>
                  <span className="px-4 py-1.5 bg-white/[0.05] border border-white/5 text-white/30 text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {exam.frequency}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 relative z-10">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} className="text-indigo-500" /> Examination Window
                    </p>
                    <p className="text-base font-black text-white tabular-nums">{exam.exam_date}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} className="text-indigo-500" /> Registration Baseline
                    </p>
                    <p className="text-base font-black text-white tabular-nums">{exam.registration_start}</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Eligibility Protocol</p>
                   <p className="text-base text-white/50 font-medium italic leading-relaxed pl-4 border-l-2 border-indigo-500/30">
                     &quot;{exam.eligibility}&quot;
                   </p>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                    <BookOpen size={16} className="text-indigo-500" /> Syllabus Intelligence
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exam.syllabus_highlights.map((topic: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase rounded-lg">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl relative z-10 group/tip overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/tip:scale-110 transition-transform">
                    <Lightbulb size={48} className="text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">
                    <Zap size={14} className="animate-pulse" /> Expert Intelligence Tip
                  </div>
                  <p className="text-sm font-medium text-white/40 leading-relaxed group-hover/tip:text-white/60 transition-colors relative z-10">
                    {exam.tip}
                  </p>
                </div>

                <a
                  href={exam.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-16 btn-primary rounded-2xl flex items-center justify-center gap-3 group text-sm font-black relative z-10"
                >
                  Official Examination Portal 
                  <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-32 space-y-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="h-32 w-32 bg-white/[0.03] rounded-[3rem] flex items-center justify-center mx-auto border border-white/5 text-white/10 relative z-10 shadow-2xl">
                <Target size={56} className="animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-white font-black text-xl tracking-tight">Intelligence Matrix Ready</p>
              <p className="text-white/20 font-bold uppercase tracking-[0.2em] text-[9px]">Select your academic parameters to discover mission-critical exams</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
