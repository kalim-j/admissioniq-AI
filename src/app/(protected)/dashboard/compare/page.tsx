'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type College = {
  id: number;
  name: string;
  location: string;
  state: string;
  type: string;
  course: string;
  cutoff_general: number;
  cutoff_obc: number;
  cutoff_sc: number;
  cutoff_st: number;
  avg_package_lpa: number;
  max_package_lpa: number;
  seats: number;
  nirf_rank: number;
  website: string;
};

export default function ComparePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selected, setSelected] = useState<College[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      const { data } = await supabase
        .from('colleges')
        .select('*')
        .order('nirf_rank', { ascending: true });
      setColleges(data || []);
      setLoading(false);
    };
    fetchColleges();
  }, []);

  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.state.toLowerCase().includes(search.toLowerCase())
  );

  const addCollege = (college: College) => {
    if (selected.length >= 3) return;
    if (selected.find(c => c.id === college.id)) return;
    setSelected([...selected, college]);
  };

  const removeCollege = (id: number) => {
    setSelected(selected.filter(c => c.id !== id));
  };

  const metrics = [
    { label: 'NIRF Rank', key: 'nirf_rank', format: (v: number) => `#${v}`, better: 'lower' },
    { label: 'General Cutoff', key: 'cutoff_general', format: (v: number) => `${v}%`, better: 'lower' },
    { label: 'OBC Cutoff', key: 'cutoff_obc', format: (v: number) => `${v}%`, better: 'lower' },
    { label: 'SC Cutoff', key: 'cutoff_sc', format: (v: number) => `${v}%`, better: 'lower' },
    { label: 'ST Cutoff', key: 'cutoff_st', format: (v: number) => `${v}%`, better: 'lower' },
    { label: 'Avg Package', key: 'avg_package_lpa', format: (v: number) => `₹${v} LPA`, better: 'higher' },
    { label: 'Max Package', key: 'max_package_lpa', format: (v: number) => `₹${v} LPA`, better: 'higher' },
    { label: 'Total Seats', key: 'seats', format: (v: number) => v, better: 'higher' },
    { label: 'State', key: 'state', format: (v: string) => v, better: 'none' },
    { label: 'Type', key: 'type', format: (v: string) => v, better: 'none' },
  ];

  const getBestValue = (key: string, better: string) => {
    if (better === 'none' || selected.length < 2) return null;
    const values = selected.map(c => c[key as keyof College] as number);
    if (better === 'lower') return Math.min(...values);
    if (better === 'higher') return Math.max(...values);
    return null;
  };

  return (
    <div className="min-h-screen bg-[#07091a] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            College Comparison
          </h1>
          <p className="text-gray-400">
            Compare up to 3 colleges side by side
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search college by name or state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-lg px-4 py-3 rounded-xl
              bg-white/[0.06] border border-white/10 text-white
              placeholder:text-gray-500 focus:outline-none
              focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Selected colleges chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {selected.map(c => (
              <div key={c.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                  bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm">
                {c.name}
                <button onClick={() => removeCollege(c.id)}
                  className="text-purple-400 hover:text-white ml-1">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* College list to pick */}
        {search && (
          <div className="mb-8 bg-white/[0.04] border border-white/10 
            rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
            {filtered.slice(0, 20).map(college => (
              <button
                key={college.id}
                onClick={() => addCollege(college)}
                disabled={selected.length >= 3 || 
                  !!selected.find(c => c.id === college.id)}
                className="w-full flex items-center justify-between px-5 py-3
                  hover:bg-white/[0.06] transition text-left border-b 
                  border-white/[0.05] last:border-0
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div>
                  <p className="text-white text-sm font-medium">{college.name}</p>
                  <p className="text-gray-500 text-xs">{college.location}, {college.state}</p>
                </div>
                <span className="text-xs text-purple-400 font-medium">
                  {selected.find(c => c.id === college.id) ? '✓ Added' : '+ Add'}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-500 text-sm p-5">No colleges found</p>
            )}
          </div>
        )}

        {/* Comparison Table */}
        {selected.length >= 2 ? (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-5 text-gray-400 text-sm font-medium w-40">
                    Metric
                  </th>
                  {selected.map(c => (
                    <th key={c.id} className="p-5 text-center">
                      <p className="text-white font-semibold text-sm">{c.name}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {c.location}, {c.state}
                      </p>
                      {c.website && (
                        <a href={c.website} target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 text-xs hover:underline mt-1 block">
                          Visit Website ↗
                        </a>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, i) => {
                  const best = getBestValue(metric.key, metric.better);
                  return (
                    <tr key={metric.label}
                      className={`border-b border-white/[0.05] 
                        ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="p-5 text-gray-400 text-sm font-medium">
                        {metric.label}
                      </td>
                      {selected.map(c => {
                        const val = c[metric.key as keyof College];
                        const isBest = best !== null && val === best;
                        return (
                          <td key={c.id} className="p-5 text-center">
                            <span className={`text-sm font-semibold px-3 py-1 rounded-lg
                              ${isBest
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'text-white'
                              }`}>
                              {metric.format(val as never)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl border border-white/10 
            bg-white/[0.02]">
            <p className="text-4xl mb-4">🆚</p>
            <p className="text-white font-semibold text-lg">
              Select at least 2 colleges to compare
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Search above and add colleges to start comparing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
