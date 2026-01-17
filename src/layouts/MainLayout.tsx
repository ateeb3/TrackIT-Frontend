import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { Bell, Search } from "lucide-react";

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-background text-neutral-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="bg-surface border-b border-neutral-800 h-16 flex items-center justify-between px-8 shadow-sm z-10">
          
          {/* Search Bar */}
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="w-full pl-10 pr-4 py-2 bg-background border border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm text-neutral-200 placeholder-neutral-600 transition-all shadow-inner"
            />
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-neutral-400 hover:text-primary-400 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-surface"></span>
            </button>
            
            <div className="h-8 w-px bg-neutral-800 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-neutral-200">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-neutral-500 capitalize">{user?.roles[0] || 'User'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-primary-500 font-bold border border-neutral-700">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
}