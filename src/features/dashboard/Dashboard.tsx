import { useEffect, useState } from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from "recharts";
import { 
  Monitor, CheckCircle, AlertTriangle, XCircle, Clock, 
  Activity, ArrowRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// Interface matches the new C# Endpoint response
interface DashboardStats {
  total: number;
  assigned: number;
  available: number;
  broken: number;
  inRepair: number;
  retired: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  
  // State for Stats
  const [stats, setStats] = useState<DashboardStats>({
    total: 0, assigned: 0, available: 0, broken: 0, inRepair: 0, retired: 0
  });

  // State for Recent Activity
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch Optimized Stats (Fast!)
      const statsRes = await api.get('/assets/stats');
      setStats(statsRes.data);

      // 2. Fetch Recent Activity (Get assignments, take top 5)
      // Note: If you have a specific recent endpoints, use that. Otherwise fetching all is okay for MVP.
      const activityRes = await api.get('/assignments');
      const sortedActivity = (activityRes.data || [])
        .sort((a: any, b: any) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
        .slice(0, 5); // Take only latest 5
      
      setRecentActivity(sortedActivity);

    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Chart Data Preparation ---
  const chartData = [
    { name: 'Available', value: stats.available, color: '#10b981' }, // Emerald-500
    { name: 'Assigned', value: stats.assigned, color: '#0ea5e9' },  // Sky-500
    { name: 'Broken', value: stats.broken, color: '#f59e0b' },      // Amber-500
    { name: 'In Repair', value: stats.inRepair, color: '#8b5cf6' }, // Violet-500
  ].filter(d => d.value > 0); // Hide empty slices

  // --- Loading Skeleton ---
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-neutral-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-surface border border-neutral-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
            <div className="lg:col-span-2 bg-surface border border-neutral-800 rounded-xl"></div>
            <div className="bg-surface border border-neutral-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-neutral-400 mt-1">Welcome back, {user?.email?.split('@')[0]}. Here is your inventory overview.</p>
      </div>

      {/* --- Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Assets */}
        <div className="bg-surface p-6 rounded-xl border border-neutral-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Monitor size={80} />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-lg text-primary-500">
              <Monitor size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-400">Total Assets</p>
              <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
            </div>
          </div>
        </div>

        {/* Available */}
        <div className="bg-surface p-6 rounded-xl border border-neutral-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
            <CheckCircle size={80} />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-400">Available</p>
              <h3 className="text-2xl font-bold text-white">{stats.available}</h3>
            </div>
          </div>
        </div>

        {/* Assigned */}
        <div className="bg-surface p-6 rounded-xl border border-neutral-800 shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-sky-500">
            <Activity size={80} />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-500/10 rounded-lg text-sky-500">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-400">Assigned</p>
              <h3 className="text-2xl font-bold text-white">{stats.assigned}</h3>
            </div>
          </div>
        </div>

        {/* Attention Needed (Broken + In Repair) */}
        <div className="bg-surface p-6 rounded-xl border border-neutral-800 shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
            <AlertTriangle size={80} />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-400">Attention Needed</p>
              <h3 className="text-2xl font-bold text-white">{stats.broken + stats.inRepair}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity List */}
        <div className="lg:col-span-2 bg-surface border border-neutral-800 rounded-xl shadow-lg flex flex-col">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-neutral-400" /> Recent Activity
            </h3>
            <Link to="/assignments" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-hidden">
             {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 italic">No recent activity.</div>
             ) : (
                <div className="divide-y divide-neutral-800">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="p-4 hover:bg-surfaceHighlight/50 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={clsx("h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold border-2", 
                            !act.returnDate ? "bg-sky-500/10 text-sky-500 border-sky-500/20" : "bg-neutral-800 text-neutral-500 border-neutral-700"
                        )}>
                            {act.userEmail ? act.userEmail.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            <span className="text-primary-400">{act.assetName}</span> 
                            <span className="text-neutral-500 mx-1">
                                {!act.returnDate ? "assigned to" : "returned by"}
                            </span>
                            {act.userEmail?.split('@')[0]}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(act.assignedDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 font-medium px-2 py-1 rounded bg-neutral-900 border border-neutral-800">
                         {!act.returnDate ? "Active" : "Returned"}
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="bg-surface border border-neutral-800 rounded-xl shadow-lg p-6 flex flex-col h-96">
          <h3 className="font-bold text-white mb-6">Asset Status</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}