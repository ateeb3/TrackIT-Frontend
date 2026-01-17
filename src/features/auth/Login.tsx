import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Monitor, ArrowRight, Mail, Lock } from "lucide-react"; 
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import clsx from "clsx";

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      const response = await api.post("/account/login", data);
      login(response.data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
      
      {/* --- BACKGROUND EFFECTS (NORDIC FOREST) --- */}
      {/* 1. Large Emerald Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-900/40 rounded-full blur-[120px] pointer-events-none opacity-60" />
      
      {/* 2. Secondary Teal Glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-900/30 rounded-full blur-[100px] pointer-events-none" />

      {/* 3. Subtle Grain/Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#065f46_1px,transparent_1px),linear-gradient(to_bottom,#065f46_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />

      {/* --- LOGIN CARD --- */}
      <div className="w-full max-w-md z-10 p-4">
        <div className="bg-surface/60 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-3xl p-8 sm:p-12 relative overflow-hidden ring-1 ring-white/10">
          
          {/* Top Decorative Gradient Line (Sage) */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-60" />

          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20 mb-6 shadow-lg shadow-primary-900/50">
              <Monitor size={32} className="text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              TrackIT
            </h1>
            <p className="text-neutral-400 text-sm">
              Asset Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500 group-focus-within/input:text-primary-300 transition-colors" />
                </div>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="block w-full rounded-xl border border-neutral-700 bg-background/50 py-3.5 pl-11 pr-4 text-white placeholder-neutral-500 focus:border-primary-500 focus:bg-background/80 focus:ring-1 focus:ring-primary-500 transition-all sm:text-sm shadow-inner"
                  placeholder="admin@trackit.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 ml-1">{String(errors.email.message)}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">Forgot?</a>
              </div>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500 group-focus-within/input:text-primary-300 transition-colors" />
                </div>
                <input
                  type="password"
                  {...register("password", { required: "Password is required" })}
                  className="block w-full rounded-xl border border-neutral-700 bg-background/50 py-3.5 pl-11 pr-4 text-white placeholder-neutral-500 focus:border-primary-500 focus:bg-background/80 focus:ring-1 focus:ring-primary-500 transition-all sm:text-sm shadow-inner"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-400 ml-1">{String(errors.password.message)}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                "w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-4 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-900/40 transition-all transform active:scale-[0.98] mt-2",
                isSubmitting ? "opacity-70 cursor-wait" : "hover:shadow-primary-500/20 hover:-translate-y-0.5"
              )}
            >
              {isSubmitting ? "Authenticating..." : "Sign In"}
              {!isSubmitting && <ArrowRight size={18} strokeWidth={2.5} />}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-neutral-500">
              Authorized personnel only
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}