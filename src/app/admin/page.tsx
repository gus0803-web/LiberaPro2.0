import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Users, Database, FileText, Settings, HelpCircle, Bell, AlertCircle } from 'lucide-react';

import Link from 'next/link';

async function getAdminStatus() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { status: 'unauthenticated', user: null, supabase };
    if (user.email !== 'gus0803@gmail.com') return { status: 'unauthorized', user, supabase };
    
    return { status: 'authorized', user, supabase };
  } catch (e) {
    return { status: 'error', user: null, supabase: null };
  }
}

export default async function AdminDashboardPage() {
  const { status, user, supabase } = await getAdminStatus();

  if (status !== 'authorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">HQ Access Denied</h1>
          <p className="text-slate-400 mb-8">
            {status === 'unauthenticated' ? 'You are currently not logged in.' : `You are logged in as ${user?.email}.`}
            <br/><br/>
            The Director HQ is highly classified and strictly restricted to <b>gus0803@gmail.com</b>.
          </p>
          <div className="flex flex-col space-y-3">
            <Link href="/login" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-colors">
              Go to Login Page
            </Link>
            <Link href="/app/dashboard" className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!supabase) return null;

  // Fetch real users
  let profiles: any[] = [];
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) profiles = data;
  } catch (error) {
    console.error('Failed to fetch profiles', error);
  }

  const activeUsersCount = profiles.filter(p => p.subscription_status === 'active').length;
  const betaUsersCount = profiles.filter(p => p.beta_tester === true).length;
  const newSignups = profiles.filter(p => new Date(p.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-slate-300 font-[family-name:var(--font-geist-sans)] selection:bg-gold-pale/30">
      
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col pt-8 bg-[#0a0a0c] sticky top-0 h-screen shrink-0">
        <div className="px-6 mb-12 flex items-center space-x-3">
          <div className="w-10 h-10 border-2 border-[#d4af37] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="text-[#d4af37] font-bold text-lg">Q</span>
          </div>
          <div>
            <h1 className="font-bold text-white tracking-widest text-sm">QUANTUM</h1>
            <p className="text-xs text-[#d4af37] tracking-widest">HQ ADMIN</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="px-4">
            <Link href="/app/dashboard" className="flex items-center space-x-4 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium text-sm">Return to App</span>
            </Link>
            <a href="#" className="flex items-center space-x-4 px-4 py-3 mt-2 bg-[#1a1814] border border-[#d4af37]/20 text-[#d4af37] rounded-lg relative overflow-hidden shadow-[inset_4px_0_0_0_#d4af37]">
              <Users className="w-5 h-5" />
              <span className="font-bold text-sm">User Insights</span>
            </a>
            <a href="#" className="flex items-center space-x-4 px-4 py-3 mt-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <Database className="w-5 h-5" />
              <span className="font-medium text-sm">Data Streams</span>
            </a>
          </div>
        </nav>

        <div className="mt-auto px-4 pb-8 space-y-2">
          <Link href="/login" className="flex items-center space-x-4 px-4 py-3 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0c]">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-medium text-gray-300 tracking-wide uppercase">HQ Users Dashboard</h2>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4af37] rounded-full border-2 border-[#0a0a0c]"></span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center">
                <span className="text-black text-xs font-bold">GUS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Gus Ramirez</span>
                <span className="text-xs text-[#d4af37]">Director</span>
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
              <h3 className="text-3xl font-bold text-white">{profiles.length.toLocaleString()}</h3>
            </div>
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <p className="text-gray-400 text-sm mb-1 font-medium">Active Subs</p>
              <h3 className="text-3xl font-bold text-[#d4af37]">{activeUsersCount.toLocaleString()}</h3>
            </div>
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <p className="text-gray-400 text-sm mb-1 font-medium">Beta Testers</p>
              <h3 className="text-3xl font-bold text-blue-400">{betaUsersCount.toLocaleString()}</h3>
            </div>
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <p className="text-gray-400 text-sm mb-1 font-medium">New (7 days)</p>
              <h3 className="text-3xl font-bold text-green-500">+{newSignups.toLocaleString()}</h3>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-[#111113] border border-white/5 rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Registered Users Directory</h3>
              <div className="text-sm text-gray-500">Sorted by newest</div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-[#1a1814] text-[#d4af37]">
                  <tr>
                    <th scope="col" className="px-6 py-4">Name</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Beta</th>
                    <th scope="col" className="px-6 py-4">State</th>
                    <th scope="col" className="px-6 py-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.length > 0 ? (
                    profiles.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-white flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-300">
                            {p.full_name ? p.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span>{p.full_name || 'Anonymous User'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.subscription_status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {p.subscription_status || 'inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.beta_tester ? (
                            <span className="text-blue-400 font-bold">Yes</span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">{p.state || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No users found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
      
    </div>
  );
}
