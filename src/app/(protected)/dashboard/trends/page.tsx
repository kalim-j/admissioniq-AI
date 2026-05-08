'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { supabase } from '@/lib/supabase';

type College = { id: number; name: string; state: string };
type TrendData = {
  year: number;
  General: number;
  OBC: number;
  SC: number;
  ST: number;
};

export default function TrendsPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('colleges').select('id, name, state')
      .order('nirf_rank', { ascending: true })
      .then(({ data }) => setColleges(data || []));
  }, []);

  const fetchTrends = async (collegeId: number) => {
    setLoading(true);
    const { data } = await supabase
      .from('cutoff_trends')
      .select('*')
      .eq('college_id', collegeId)
      .order('year', { ascending: true });

    const formatted = (data || []).map(d => ({
      year: d.year,
      General: d.cutoff_general,
      OBC: d.cutoff_obc,
      SC: d.cutoff_sc,
      ST: d.cutoff_st,
    }));
    setTrends(formatted);
    setLoading(false);
  };

  const handleSelect = (id: number) => {
    setSelected(id);
    fetchTrends(id);
    setSearch('');
  };

  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCollege = colleges.find(c => c.id === selected);

  return (
    <div className="min-h-screen bg-[#07091a] p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Cutoff Trends
          </h1>
          <p className="text-gray-400">
            See how college cutoffs changed from 2020 to 2024
          </p>
        </div>

        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search and select a college..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-lg px-4 py-3 rounded-xl
              bg-white/[0.06] border border-white/10 text-white
              placeholder:text-gray-500 focus:outline-none
              focus:border-purple-500"
          />
          {search && (
            <div className="absolute top-14 left-0 w-full max-w-lg
              bg-[#0d1024] border border-white/10 rounded-xl
              overflow-hidden max-h-60 overflow-y-auto z-50 shadow-2xl">
              {filtered.slice(0, 15).map(c => (
                <button key={c.id} onClick={() => handleSelect(c.id)}
                  className="w-full px-4 py-3 text-left hover:bg-white/[0.06]
                    border-b border-white/[0.05] last:border-0 transition">
                  <p className="text-white text-sm">{c.name}</p>
                  <p className="text-gray-500 text-xs">{c.state}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCollege && (
          <div className="mb-4">
            <span className="px-4 py-2 rounded-xl bg-purple-500/20
              border border-purple-500/30 text-purple-300 text-sm">
              📊 {selectedCollege.name}
            </span>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 
              border-purple-500 border-t-transparent animate-spin" />
          </div>
        )}

        {trends.length > 0 && !loading && (
          <div className="bg-white/[0.04] border border-white/10 
            rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-6">
              Cutoff Trend 2020–2024
            </h2>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12}
                  domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1024',
                    border: '1px solid #ffffff20',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`${value}%`]}
                />
                <Legend />
                <Line type="monotone" dataKey="General"
                  stroke="#a855f7" strokeWidth={2.5}
                  dot={{ fill: '#a855f7', r: 5 }} />
                <Line type="monotone" dataKey="OBC"
                  stroke="#3b82f6" strokeWidth={2.5}
                  dot={{ fill: '#3b82f6', r: 5 }} />
                <Line type="monotone" dataKey="SC"
                  stroke="#22c55e" strokeWidth={2.5}
                  dot={{ fill: '#22c55e', r: 5 }} />
                <Line type="monotone" dataKey="ST"
                  stroke="#f97316" strokeWidth={2.5}
                  dot={{ fill: '#f97316', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['General', 'OBC', 'SC', 'ST'].map((cat, i) => {
                const latest = trends[trends.length - 1];
                const first = trends[0];
                const change = (latest?.[cat as keyof TrendData] as number) -
                  (first?.[cat as keyof TrendData] as number);
                return (
                  <div key={cat}
                    className="bg-white/[0.04] border border-white/10
                      rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-xs mb-1">{cat}</p>
                    <p className="text-white font-bold text-lg">
                      {latest?.[cat as keyof TrendData]}%
                    </p>
                    <p className={`text-xs mt-1 ${
                      change < 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {change < 0 ? '↓' : '↑'} 
                      {Math.abs(change).toFixed(1)}% since 2020
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!selected && (
          <div className="text-center py-20 rounded-2xl
            border border-white/10 bg-white/[0.02]">
            <p className="text-4xl mb-4">📈</p>
            <p className="text-white font-semibold text-lg">
              Select a college to view cutoff trends
            </p>
            <p className="text-gray-400 text-sm mt-2">
              See 5-year cutoff history for any college
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
