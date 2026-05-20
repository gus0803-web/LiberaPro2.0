import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminMap } from '@/components/AdminMap';
import { AdminChart } from '@/components/AdminChart';
import { LayoutDashboard, Users, Database, FileText, Settings, HelpCircle, Bell } from 'lucide-react';

// Require strictly gus0803@gmail.com
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (user.email !== 'gus0803@gmail.com') {
    redirect('/app/dashboard');
  }

  return { supabase, user };
}

export default async function AdminDashboardPage() {
  const { supabase, user } = await verifyAdmin();

  // Fetch actual total users from Supabase for the global counter
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const displayUsers = totalUsers ? totalUsers : 12845901; // fallback to mockup number if db empty

  // Mock data for heatmap and charts
  const heatmapData = [
    { state: 'CDMX', count: 1200 },
    { state: 'Jalisco', count: 900 },
    { state: 'Nuevo León', count: 2800 },
    { state: 'Veracruz', count: 1200 },
    { state: 'State of Mexico', count: 1200 }
  ];

  const chartData = [
    { name: 'Sun', total: 0.5, activos: 0.5 },
    { name: 'Mon', total: 0.7, activos: 0.7 },
    { name: 'Tue', total: 0.6, activos: 0.6 },
    { name: 'Wed', total: 1.0, activos: 1.0 },
    { name: 'Thu', total: 1.3, activos: 1.3 },
    { name: 'Fri', total: 1.2, activos: 1.2 },
    { name: 'Sat', total: 1.6, activos: 1.6 },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-slate-300 font-[family-name:var(--font-geist-sans)] selection:bg-gold-pale/30">
      
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col pt-8 bg-[#0a0a0c] sticky top-0 h-screen shrink-0">
        <div className="px-6 mb-12 flex items-center space-x-3">
          <div className="w-10 h-10 border-2 border-[#d4af37] rounded-full flex items-center justify-center">
            <span className="text-[#d4af37] font-bold text-lg">Q</span>
          </div>
          <div>
            <h1 className="font-bold text-white tracking-widest text-sm">QUANTUM</h1>
            <p className="text-xs text-gray-500 tracking-widest">ANALYTICA</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="px-4">
            <a href="#" className="flex items-center space-x-4 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium text-sm">Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-4 px-4 py-3 bg-[#1a1814] border border-[#d4af37]/20 text-[#d4af37] rounded-lg relative overflow-hidden shadow-[inset_4px_0_0_0_#d4af37]">
              <Users className="w-5 h-5" />
              <span className="font-bold text-sm">User Insights</span>
            </a>
            <a href="#" className="flex items-center space-x-4 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <Database className="w-5 h-5" />
              <span className="font-medium text-sm">Data Streams</span>
            </a>
            <a href="#" className="flex items-center space-x-4 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <FileText className="w-5 h-5" />
              <span className="font-medium text-sm">Reports</span>
            </a>
          </div>
        </nav>

        <div className="mt-auto px-4 pb-8 space-y-2">
          <a href="#" className="flex items-center space-x-4 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </a>
          <a href="#" className="flex items-center space-x-4 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Support</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0c]">
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-xl font-medium text-gray-300 tracking-wide uppercase">Mexico User Insights Dashboard</h2>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4af37] rounded-full border-2 border-[#0a0a0c]"></span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold">GUS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">G. Ramirez</span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-6 overflow-y-auto">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl">
              <p className="text-gray-400 text-sm mb-1 font-medium">Total Users</p>
              <h3 className="text-3xl font-bold text-white">{displayUsers.toLocaleString()}</h3>
            </div>
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl">
              <p className="text-gray-400 text-sm mb-1 font-medium">Active States</p>
              <h3 className="text-3xl font-bold text-white">32/32</h3>
            </div>
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <p className="text-gray-400 text-sm mb-1 font-medium">Avg. Engagement</p>
              <h3 className="text-3xl font-bold text-white">89.4%</h3>
              <svg className="absolute bottom-4 right-4 w-12 h-6 text-[#d4af37]" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="3"><path d="M0 25 L30 15 L50 20 L80 5 L100 10" /></svg>
            </div>
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <p className="text-gray-400 text-sm mb-1 font-medium">New Signups</p>
              <h3 className="text-3xl font-bold text-white">104,212</h3>
              <svg className="absolute bottom-4 right-4 w-12 h-6 text-green-500" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="3"><path d="M0 25 L40 10 L60 15 L90 0 L100 5" /></svg>
            </div>
          </div>

          {/* Map Area */}
          <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white">Real-Time User Density by State</h3>
              <select className="bg-[#1a1814] border border-white/10 text-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#d4af37]">
                <option>32 States</option>
              </select>
            </div>
            
            <div className="h-[400px] w-full flex items-center justify-center relative">
              {/* Fallback styling for Map if AdminMap doesn't look dark enough */}
              <div className="absolute inset-0 opacity-80 filter drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <AdminMap data={heatmapData} />
              </div>
              
              {/* User Density Legend */}
              <div className="absolute bottom-0 left-0">
                <p className="text-sm font-medium text-white mb-2">User Density</p>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-24 bg-gradient-to-t from-[#0a1b2b] to-[#d4af37] rounded-sm"></div>
                  <div className="flex flex-col justify-between h-24 text-xs text-gray-400">
                    <span>High</span>
                    <span>Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4">Total Users: 12.8M <span className="text-green-500">(+4.2%)</span></h3>
              <div className="h-48">
                <AdminChart data={chartData} />
              </div>
            </div>
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4">User Growth by Region (2023)</h3>
              <div className="h-48 flex items-end justify-between px-2 pb-6 border-b border-white/10 relative">
                {/* Y-axis markers */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-600">
                  <span>40M</span><span>30M</span><span>20M</span><span>10M</span><span>0</span>
                </div>
                {/* Bars */}
                {[20, 35, 45, 55, 65, 80, 100].map((h, i) => (
                  <div key={i} className="w-8 ml-8 bg-gradient-to-t from-[#8c7322] to-[#d4af37]" style={{ height: `${h}%` }}></div>
                ))}
                {/* X-axis labels */}
                <div className="absolute left-10 right-0 bottom-0 flex justify-between text-[10px] text-gray-500">
                  <span>2023</span><span>2023</span><span>2023</span><span>2022</span><span>2023</span><span>2023</span>
                </div>
              </div>
            </div>
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4">Active Session Breakdown</h3>
              <div className="h-48 flex items-center justify-center relative">
                {/* Fake Pie Chart */}
                <div className="w-32 h-32 rounded-full border-[16px] border-[#333] relative">
                  <div className="absolute inset-[-16px] rounded-full border-[16px] border-[#d4af37] clip-half-right transform rotate-45"></div>
                  <div className="absolute inset-[-16px] rounded-full border-[16px] border-[#8c7322] clip-half-bottom"></div>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-xs text-gray-400"><span className="w-2 h-2 bg-[#d4af37]"></span><span>Gold</span></div>
                <div className="flex items-center space-x-1 text-xs text-gray-400"><span className="w-2 h-2 bg-[#8c7322]"></span><span>Silver</span></div>
                <div className="flex items-center space-x-1 text-xs text-gray-400"><span className="w-2 h-2 bg-[#333]"></span><span>Dark</span></div>
              </div>
            </div>
          </div>

        </div>
      </main>
      
    </div>
  );
}
