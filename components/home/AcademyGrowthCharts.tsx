'use client';

import React, { useState, useSyncExternalStore } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  IndianRupee,
  FileCheck,
} from 'lucide-react';

interface AcademyGrowthChartsProps {
  onJoinClick: () => void;
  onScholarshipClick: () => void;
}

// 3-Year Enrollment Data
const ENROLLMENT_DATA = [
  {
    year: '2024',
    total: 180,
    grassroots: 90,
    development: 65,
    elite: 25,
    girlsAcademy: 15,
    campuses: 1,
    growthRate: 'Baseline',
    label: 'Gayeshpur Launch',
  },
  {
    year: '2025',
    total: 320,
    grassroots: 145,
    development: 115,
    elite: 60,
    girlsAcademy: 38,
    campuses: 2,
    growthRate: '+77.8%',
    label: 'Ichapore Campus Added',
  },
  {
    year: '2026',
    total: 465,
    grassroots: 195,
    development: 170,
    elite: 100,
    girlsAcademy: 68,
    campuses: 3,
    growthRate: '+45.3%',
    label: '3 Hubs + Krishnanagar',
  },
];

// 3-Year Scholarship & Financial Aid Data
const SCHOLARSHIP_TREND_DATA = [
  {
    year: '2024',
    scholarsCount: 14,
    aidAmountLakhs: 5.6,
    fullMerit: 8,
    subsidizedAid: 6,
    girlsEmpowerment: 4,
  },
  {
    year: '2025',
    scholarsCount: 28,
    aidAmountLakhs: 11.8,
    fullMerit: 16,
    subsidizedAid: 12,
    girlsEmpowerment: 10,
  },
  {
    year: '2026',
    scholarsCount: 48,
    aidAmountLakhs: 19.5,
    fullMerit: 26,
    subsidizedAid: 22,
    girlsEmpowerment: 18,
  },
];

// Current Scholarship Category Distribution for Pie Chart
const SCHOLARSHIP_CATEGORY_DATA = [
  { name: '100% Full Talent Merit Waiver', value: 26, color: '#f59e0b', share: '54%' },
  { name: 'Need-Based Subsidized Academy Aid', value: 14, color: '#10b981', share: '29%' },
  { name: 'Girls in Sport Empowerment Grant', value: 8, color: '#ec4899', share: '17%' },
];

// Parent Trust Indicators
const TRUST_METRICS = [
  {
    icon: ShieldCheck,
    title: '89.4% Student Retention',
    subtitle: 'Year-on-year family continuity rate',
    detail: 'Over 89% of enrolled players continue into subsequent seasons, demonstrating immense parental confidence.',
    highlight: 'Top 5% in Bengal',
  },
  {
    icon: GraduationCap,
    title: '100% Academic Compliance',
    subtitle: 'Mandatory school report card checks',
    detail: 'Academy staff monitor school performance quarterly. Football training and academic excellence go hand in hand.',
    highlight: 'Zero Compromise',
  },
  {
    icon: FileCheck,
    title: 'AFC ‘B’ Verified Methodology',
    subtitle: 'Licensed youth coaches on pitch',
    detail: 'Strict 1:10 coach-to-student ratio ensuring every youngster receives personalized development attention.',
    highlight: 'AIFF & AFC Audited',
  },
  {
    icon: Award,
    title: '₹36.9L Cumulative Aid',
    subtitle: 'Distributed without community bias',
    detail: 'Over 3 years, every gifted grassroots talent has been sponsored through our transparent merit scholarship pool.',
    highlight: '48 Active Scholars',
  },
];

const emptySubscribe = () => () => {};

export const AcademyGrowthCharts: React.FC<AcademyGrowthChartsProps> = ({
  onJoinClick,
  onScholarshipClick,
}) => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [activeTab, setActiveTab] = useState<'enrollment' | 'scholarship' | 'trust'>('enrollment');

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200 relative overflow-hidden">
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>3-Year Audited Progression (2024–2026)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            DATA-DRIVEN TRUST FOR PARENTS
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Transparent metrics tracking our rapid academy enrollment surge, verifiable scholarship allocation, and holistic academic-athletic balance across all 3 campuses.
          </p>

          {/* Interactive Navigation Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('enrollment')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'enrollment'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Enrollment Growth (465+ Players)</span>
            </button>
            <button
              onClick={() => setActiveTab('scholarship')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'scholarship'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Scholarship Aid (₹19.5L in 2026)</span>
            </button>
            <button
              onClick={() => setActiveTab('trust')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'trust'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Parent Trust & Retention</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Growth in Academy Enrollments */}
        {activeTab === 'enrollment' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
              {/* Main Area / Line Visualization */}
              <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-amber-700 font-bold tracking-wider">
                      Cohort Expansion (2024 vs 2025 vs 2026)
                    </span>
                    <h3 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight">
                      Total Active Players Enrolled
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span>Grassroots</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-3 h-3 rounded-full bg-slate-900" />
                      <span>Development</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Elite Pre-Pro</span>
                    </div>
                  </div>
                </div>

                {/* Recharts Area Chart */}
                <div className="w-full h-72 sm:h-80">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={ENROLLMENT_DATA}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorDev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="year"
                          tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 500]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            border: '1px solid #334155',
                            color: '#fff',
                            fontSize: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                          }}
                          labelStyle={{ fontWeight: 800, color: '#f59e0b' }}
                          formatter={(value: any, name: any) => {
                            const nameMap: Record<string, string> = {
                              total: 'Total Academy Players',
                              grassroots: 'U8–U10 Grassroots',
                              development: 'U11–U14 Development',
                              elite: 'U15–U18 Elite Cohort',
                            };
                            return [`${value} Athletes`, nameMap[name] || name];
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorTotal)"
                          name="total"
                        />
                        <Area
                          type="monotone"
                          dataKey="development"
                          stroke="#0f172a"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorDev)"
                          name="development"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-2xl animate-pulse" />
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Audited student registrations verified by IFA Affiliation Registry</span>
                  </div>
                  <span className="font-mono text-slate-700 font-bold">+158% 3-Year Total Growth</span>
                </div>
              </div>

              {/* Side Cards: 3-Year Milestone Cards */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                {ENROLLMENT_DATA.map((item) => (
                  <div
                    key={item.year}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono text-xs font-black">
                          {item.year}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {item.growthRate}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {item.total}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">Registered Athletes</span>
                    </div>

                    {/* Progress Bar Representation */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${(item.grassroots / item.total) * 100}%` }}
                        title={`Grassroots: ${item.grassroots}`}
                      />
                      <div
                        className="bg-slate-800 h-full"
                        style={{ width: `${(item.development / item.total) * 100}%` }}
                        title={`Development: ${item.development}`}
                      />
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(item.elite / item.total) * 100}%` }}
                        title={`Elite: ${item.elite}`}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-1">
                      <span>{item.campuses} {item.campuses === 1 ? 'Campus' : 'Campuses'} Active</span>
                      <span>{item.girlsAcademy} Girls Enrolled</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Scholarship Distribution & Financial Aid */}
        {activeTab === 'scholarship' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
              {/* Bar Chart: 3-Year Financial Aid Growth */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-emerald-700 font-bold tracking-wider">
                      Fee Waiver & Talent Sponsoring (₹ in Lakhs)
                    </span>
                    <h3 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight">
                      Annual Scholarship Fund Disbursed
                    </h3>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                    ₹36.9L Total 3-Yr Aid
                  </div>
                </div>

                <div className="w-full h-72 sm:h-80">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={SCHOLARSHIP_TREND_DATA}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="year"
                          tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          unit="L"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            border: '1px solid #334155',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                          formatter={(value: any, name: any) => {
                            if (name === 'aidAmountLakhs') return [`₹${value} Lakhs`, 'Total Financial Aid'];
                            if (name === 'scholarsCount') return [`${value} Students`, 'Total Scholars'];
                            return [value, name];
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                          formatter={(value) => (value === 'aidAmountLakhs' ? 'Aid Disbursed (₹ Lakhs)' : 'Scholars Granted')}
                        />
                        <Bar
                          dataKey="aidAmountLakhs"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                          name="aidAmountLakhs"
                        />
                        <Bar
                          dataKey="scholarsCount"
                          fill="#f59e0b"
                          radius={[6, 6, 0, 0]}
                          name="scholarsCount"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-2xl animate-pulse" />
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>Sponsored by MADEN Philanthropic Trust & CSR Partnerships</span>
                  <span className="font-bold text-emerald-700">100% Zero-Tuition for Full Merit</span>
                </div>
              </div>

              {/* Pie Chart: Category Distribution */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase text-amber-700 font-bold tracking-wider">
                    Current Cohort Split (48 Active Scholars)
                  </span>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight mt-1">
                    Scholarship Distribution
                  </h3>
                </div>

                <div className="w-full h-56 sm:h-60 my-2">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={SCHOLARSHIP_CATEGORY_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {SCHOLARSHIP_CATEGORY_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                          formatter={(value: any, name: any) => [`${value} Players (${SCHOLARSHIP_CATEGORY_DATA.find(d => d.name === name)?.share})`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-2xl animate-pulse" />
                  )}
                </div>

                {/* Legend List */}
                <div className="space-y-2 text-xs">
                  {SCHOLARSHIP_CATEGORY_DATA.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-semibold text-slate-800 line-clamp-1">{cat.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{cat.value} ({cat.share})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Parent Trust & Retention Indicators */}
        {activeTab === 'trust' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TRUST_METRICS.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] font-mono font-bold uppercase">
                        {metric.highlight}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                        {metric.title}
                      </h4>
                      <p className="text-xs text-amber-700 font-semibold mt-0.5 font-mono">
                        {metric.subtitle}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {metric.detail}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Parent Committee Approved</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Parent Reassurance Callout Box */}
        <div className="mt-10 sm:mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Transparent Parent Enrollment Guarantee</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Every Child Deserves Professional Mentorship & Clear Pathways
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Whether enrolling in our paid youth cohorts or applying for full need-based scholarship assessment, parents receive complete fee transparency, certified coaching oversight, and progress telemetry.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={onJoinClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Assessment Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onScholarshipClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/20 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Scholarship Criteria</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
