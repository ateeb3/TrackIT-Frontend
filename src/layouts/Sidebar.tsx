import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Monitor, Users, History, 
  LogOut, Package, ChevronLeft, ChevronRight, Settings as SettingsIcon 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import clsx from "clsx";

export default function Sidebar() {
  const { logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Defined menu structure
  const menuGroups = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "Inventory",
      items: [
        { label: "Assets", path: "/assets", icon: Monitor },
        { label: "Assignments", path: "/assignments", icon: History },
        ...(isAdmin ? [{ label: "Categories", path: "/categories", icon: Package }] : [])
      ]
    },
    // --- NEW GROUP FOR SETTINGS ---
    
    {
      title: "System",
      hidden: !isAdmin, 
      items: [
        ...(isAdmin ? [{ label: "Users", path: "/users", icon: Users }] : [])
      ]
    },
    {
      title: "Account", 
      items: [
        { label: "Settings", path: "/settings", icon: SettingsIcon }
      ]
    },
    
  ];

  return (
    <aside 
      className={clsx(
        "bg-surface border-r border-neutral-800 h-screen flex flex-col transition-all duration-300 relative z-20",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* --- Toggle Button --- */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-9 bg-surfaceHighlight border border-neutral-700 text-neutral-400 hover:text-white rounded-full p-1 shadow-md transition-colors z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* --- Logo Area --- */}
      <div className="h-16 flex items-center justify-center border-b border-neutral-800/50 shrink-0">
        <div className="flex items-center gap-2 font-bold text-xl text-primary-500">
          <div className="bg-primary-500/10 text-primary-500 p-1.5 rounded-lg border border-primary-500/20">
            <Monitor size={20} />
          </div>
          {!collapsed && <span className="tracking-tight text-neutral-100">TrackIT</span>}
        </div>
      </div>

      {/* --- Navigation --- */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {menuGroups.map((group, groupIndex) => {
          if (group.hidden) return null;

          return (
            <div key={group.title}>
              {/* Section Heading */}
              {!collapsed && (
                <div className="px-3 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {/* Divider for collapsed state */}
              {collapsed && groupIndex > 0 && (
                <div className="mx-3 my-2 border-t border-neutral-800" />
              )}

              {/* Items */}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                      isActive 
                        ? "bg-primary-500/10 text-primary-400 font-medium border border-primary-500/20 shadow-sm" 
                        : "text-neutral-400 hover:bg-surfaceHighlight hover:text-neutral-200"
                    )}
                  >
                    <item.icon size={20} className={clsx("shrink-0 transition-transform", !collapsed && "group-hover:scale-105")} />
                    
                    {!collapsed && (
                      <span className="truncate text-sm">{item.label}</span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-neutral-800 shadow-xl z-50">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* --- Simple Footer (Sign Out Only) --- */}
      <div className="p-3 border-t border-neutral-800/50">
        <button
          onClick={logout}
          className={clsx(
            "flex items-center gap-3 w-full px-3 py-2.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors",
            collapsed ? "justify-center" : ""
          )}
          title="Sign Out"
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}