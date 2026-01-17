import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { User, Lock, Shield, Mail, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import clsx from "clsx";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // -- Change Password Form Logic --
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onChangePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      // Ensure your Backend has this endpoint! (See Step 4 below)
      await api.post('/account/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        email: user?.email // Some backends need email to identify user
      });
      toast.success("Password changed successfully");
      reset();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to change password";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Account Settings</h1>
      <p className="text-neutral-400 mb-8">Manage your profile and security preferences.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* --- Sidebar Tabs --- */}
        <div className="col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
              activeTab === 'profile' 
                ? "bg-surfaceHighlight text-white shadow-md border border-neutral-700" 
                : "text-neutral-400 hover:text-white hover:bg-surface"
            )}
          >
            <User size={18} /> My Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
              activeTab === 'security' 
                ? "bg-surfaceHighlight text-white shadow-md border border-neutral-700" 
                : "text-neutral-400 hover:text-white hover:bg-surface"
            )}
          >
            <Shield size={18} /> Security
          </button>
        </div>

        {/* --- Content Area --- */}
        <div className="col-span-1 md:col-span-3">
          
          {/* TAB 1: PROFILE INFO */}
          {activeTab === 'profile' && (
            <div className="bg-surface border border-neutral-800 rounded-xl p-8 shadow-lg animate-in fade-in duration-300">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-primary-500" /> Public Profile
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-neutral-800">
                  <div className="h-20 w-20 rounded-full bg-neutral-800 flex items-center justify-center text-2xl font-bold text-neutral-400 border-2 border-neutral-700">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">
                        {user?.email?.split('@')[0]}
                    </h3>
                    <p className="text-neutral-500 text-sm">
                        {user?.roles?.join(', ') || "User"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                        <div className="flex items-center gap-3 text-neutral-300 bg-background p-3 rounded-lg border border-neutral-800">
                            <Mail size={16} />
                            {user?.email}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Role</label>
                        <div className="flex items-center gap-3 text-neutral-300 bg-background p-3 rounded-lg border border-neutral-800">
                            <Shield size={16} />
                            {user?.roles?.[0]}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY (CHANGE PASSWORD) */}
          {activeTab === 'security' && (
            <div className="bg-surface border border-neutral-800 rounded-xl p-8 shadow-lg animate-in fade-in duration-300">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Lock size={20} className="text-primary-500" /> Change Password
              </h2>

              <form onSubmit={handleSubmit(onChangePassword)} className="space-y-5 max-w-md">
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Current Password</label>
                    <input 
                        type="password"
                        {...register("currentPassword", { required: "Current password is required" })}
                        className="w-full bg-background border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary-500 transition-all"
                        placeholder="••••••••"
                    />
                    {errors.currentPassword && <span className="text-xs text-rose-500">{String(errors.currentPassword.message)}</span>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">New Password</label>
                    <input 
                        type="password"
                        {...register("newPassword", { 
                            required: "New password is required",
                            minLength: { value: 6, message: "Must be at least 6 characters" }
                        })}
                        className="w-full bg-background border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary-500 transition-all"
                        placeholder="••••••••"
                    />
                    {errors.newPassword && <span className="text-xs text-rose-500">{String(errors.newPassword.message)}</span>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Confirm New Password</label>
                    <input 
                        type="password"
                        {...register("confirmPassword", { required: "Please confirm password" })}
                        className="w-full bg-background border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary-500 transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-900/20 transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        {isSubmitting ? "Updating..." : "Update Password"}
                    </button>
                </div>

              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}