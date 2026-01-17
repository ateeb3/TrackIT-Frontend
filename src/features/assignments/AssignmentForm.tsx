import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Save, ArrowLeft, Monitor, User, Calendar } from "lucide-react";
import api from "../../api/axios";

interface AssignmentFormData {
  assetId: number;
  userId: string;
  assignedDate: string;
}

export default function AssignmentForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<AssignmentFormData>();
  
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDependencies();
  }, []);

  const loadDependencies = async () => {
    try {
      // 1. Load Users
      const userRes = await api.get('/users');
      setUsers(userRes.data);

      // 2. Load Assets
      const assetRes = await api.get('/assets?pageSize=1000'); 
      const allAssets = assetRes.data.items || assetRes.data;
      
      // Filter for dropdown: Only show Available ones OR the one currently assigned if editing
      const availableAssets = allAssets.filter((a: any) => a.status === 'Available' || a.status === 1);
      setAssets(availableAssets);

      // 3. If Edit Mode, Load Current Assignment
      if (isEditMode) {
        const currentRes = await api.get(`/assignments/${id}`);
        setValue("userId", currentRes.data.userId);
        setValue("assetId", currentRes.data.assetId);
        if (currentRes.data.assignedDate) {
            setValue("assignedDate", currentRes.data.assignedDate.split('T')[0]);
        }
        
        // Ensure the current asset is in the dropdown even if not "Available" anymore
        if (!availableAssets.find((a: any) => a.id === currentRes.data.assetId)) {
            setAssets(prev => [...prev, { id: currentRes.data.assetId, name: currentRes.data.assetName + " (Current)" }]);
        }
      } else {
        // Default date to today
        setValue("assignedDate", new Date().toISOString().split('T')[0]);
      }

    } catch (error) {
      toast.error("Failed to load form data");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      const payload = {
        ...data,
        assetId: Number(data.assetId)
      };

      if (isEditMode) {
        await api.put(`/assignments/${id}`, payload);
        toast.success("Assignment updated");
      } else {
        // ✅ FIX: Use the specific 'checkout' endpoint defined in Controller
        await api.post("/assignments/checkout", payload);
        toast.success("Asset assigned successfully");
      }
      navigate("/assignments");
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
        <Link to="/assignments" className="p-2 rounded-lg bg-surface border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Assignment" : "New Assignment"}
          </h1>
          <p className="text-sm text-neutral-400">
             {isEditMode ? "Modify assignment details." : "Checkout an asset to a user."}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface border border-neutral-800 rounded-xl p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Asset Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Select Asset</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Monitor className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <select
                {...register("assetId", { required: "Asset is required" })}
                className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-8 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm appearance-none"
              >
                <option value="">-- Choose available asset --</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.serialNumber} - {asset.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.assetId && <p className="text-xs text-rose-400 ml-1">{errors.assetId.message}</p>}
          </div>

          {/* User Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Assign To User</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <select
                {...register("userId", { required: "User is required" })}
                className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-8 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm appearance-none"
              >
                <option value="">-- Choose user --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>
            {errors.userId && <p className="text-xs text-rose-400 ml-1">{errors.userId.message}</p>}
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Assignment Date</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="date"
                {...register("assignedDate", { required: "Date is required" })}
                className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm [color-scheme:dark]"
              />
            </div>
            {errors.assignedDate && <p className="text-xs text-rose-400 ml-1">{errors.assignedDate.message}</p>}
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-neutral-800 flex justify-end gap-3">
             <Link 
               to="/assignments"
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
               {isSubmitting ? "Processing..." : "Confirm Assignment"}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}