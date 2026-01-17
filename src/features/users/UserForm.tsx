import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Save, ArrowLeft, Mail, Lock, Shield } from "lucide-react";
import api from "../../api/axios";

interface UserFormData {
  email: string;
  password?: string; // Optional because we don't send it on Edit
  role: string;      // Simple single-role selection for now
}

export default function UserForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<UserFormData>();
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setValue("email", response.data.email);
      // Assuming backend returns roles array: ["Admin"] or ["User"]
      setValue("role", response.data.roles?.[0] || "User");
    } catch (error) {
      toast.error("Failed to load user");
      navigate("/users");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditMode) {
        // Edit Mode: Usually updates Roles or specific fields
        await api.put(`/users/${id}`, { 
            email: data.email, 
            roles: [data.role] 
        });
        toast.success("User updated successfully");
      } else {
        // Create Mode: Uses Register endpoint
        await api.post("/account/register", {
            email: data.email,
            password: data.password,
            roles: [data.role]
        });
        toast.success("User created successfully");
      }
      navigate("/users");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Operation failed";
      toast.error(msg);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-neutral-400">Loading form...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/users" className="p-2 rounded-lg bg-surface border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? "Edit User" : "New User"}
          </h1>
          <p className="text-sm text-neutral-400">
             {isEditMode ? "Modify user permissions." : "Create a new account for system access."}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface border border-neutral-800 rounded-xl p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                // Disable email editing in edit mode if your backend doesn't support it easily
                readOnly={isEditMode} 
                className={`block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm placeholder-neutral-600 ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder="user@trackit.com"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-400 ml-1">{errors.email.message}</p>}
          </div>

          {/* Password Input (Only for New Users) */}
          {!isEditMode && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="password"
                  {...register("password", { 
                      required: "Password is required",
                      minLength: { value: 6, message: "Must be at least 6 characters" } 
                  })}
                  className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm placeholder-neutral-600"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-rose-400 ml-1">{errors.password.message}</p>}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Role</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <select
                {...register("role", { required: "Role is required" })}
                className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-8 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm appearance-none"
              >
                <option value="User">User (Standard Access)</option>
                <option value="Admin">Admin (Full Access)</option>
              </select>
            </div>
            <p className="text-xs text-neutral-500 ml-1">Admins can manage other users and system settings.</p>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-neutral-800 flex justify-end gap-3">
             <Link 
               to="/users"
               className="px-4 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors text-sm font-medium"
             >
               Cancel
             </Link>
             <button
               type="submit"
               disabled={isSubmitting}
               className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 text-sm font-bold"
             >
               <Save size={18} />
               {isSubmitting ? "Saving..." : "Save User"}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}
