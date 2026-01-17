import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Save, ArrowLeft, Calendar, Tag, Hash, Type } from "lucide-react";
import api from "../../api/axios";
import clsx from "clsx";

interface AssetFormData {
  name: string;
  serialNumber: string;
  categoryId: number;
  status: number;
  purchaseDate: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AssetForm() {
  const { id } = useParams(); // If id exists, we are in EDIT mode
  const isEditMode = !!id;
  
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<AssetFormData>();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Status Options (Mapped to Enum on Backend)
  const statusOptions = [
    { label: 'Available', value: 1 },
    { label: 'Assigned', value: 2 },
    { label: 'Broken', value: 3 },
    { label: 'Retired', value: 4 },
    { label: 'In Repair', value: 5 }
  ];

  useEffect(() => {
    loadDependencies();
  }, []);

  const loadDependencies = async () => {
    try {
      // 1. Fetch Categories for the dropdown
      const catResponse = await api.get('/categories');
      setCategories(catResponse.data);

      // 2. If Edit Mode, Fetch Asset Data
      if (isEditMode) {
        const assetResponse = await api.get(`/assets/${id}`);
        const data = assetResponse.data;
        
        // Pre-fill form
        setValue("name", data.name);
        setValue("serialNumber", data.serialNumber);
        setValue("categoryId", data.categoryId);
        setValue("status", data.status); // Backend sends int or string? Assuming int based on previous code
        
        // Format Date for Input (YYYY-MM-DD)
        if (data.purchaseDate) {
           setValue("purchaseDate", data.purchaseDate.split('T')[0]);
        }
      }
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/assets");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AssetFormData) => {
    try {
      // Ensure numbers are numbers
      const payload = {
        ...data,
        categoryId: Number(data.categoryId),
        status: Number(data.status)
      };

      if (isEditMode) {
        await api.put(`/assets/${id}`, payload);
        toast.success("Asset updated successfully");
      } else {
        await api.post("/assets", payload);
        toast.success("Asset created successfully");
      }
      navigate("/assets");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  if (isLoading) return <div className="p-10 text-center text-neutral-400">Loading form...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/assets" className="p-2 rounded-lg bg-surface border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Asset" : "New Asset"}
          </h1>
          <p className="text-sm text-neutral-400">
            {isEditMode ? "Update asset details and status." : "Add a new hardware item to inventory."}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface border border-neutral-800 rounded-xl p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Asset Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Type className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm placeholder-neutral-600"
                  placeholder="e.g. MacBook Pro 16"
                />
              </div>
              {errors.name && <p className="text-xs text-rose-400 ml-1">{errors.name.message}</p>}
            </div>

            {/* Serial Number */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Serial Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  {...register("serialNumber", { required: "Serial Number is required" })}
                  className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm placeholder-neutral-600 font-mono"
                  placeholder="SN-1234-5678"
                />
              </div>
              {errors.serialNumber && <p className="text-xs text-rose-400 ml-1">{errors.serialNumber.message}</p>}
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Category</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <select
                  {...register("categoryId", { required: "Category is required" })}
                  className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-8 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm appearance-none"
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {errors.categoryId && <p className="text-xs text-rose-400 ml-1">{errors.categoryId.message}</p>}
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Purchase Date</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="date"
                  {...register("purchaseDate", { required: "Date is required" })}
                  className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm [color-scheme:dark]"
                />
              </div>
              {errors.purchaseDate && <p className="text-xs text-rose-400 ml-1">{errors.purchaseDate.message}</p>}
            </div>

            {/* Status (Full Width) */}
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {statusOptions.map((option) => (
                  <label 
                    key={option.value}
                    className="relative flex cursor-pointer"
                  >
                    <input 
                      type="radio" 
                      value={option.value} 
                      {...register("status", { required: true })}
                      className="peer sr-only"
                    />
                    <div className={clsx(
                      "w-full text-center px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                      "border-neutral-700 bg-background text-neutral-400 hover:border-neutral-600",
                      "peer-checked:bg-primary-600 peer-checked:text-white peer-checked:border-primary-500 peer-checked:shadow-lg peer-checked:shadow-primary-900/20"
                    )}>
                      {option.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-neutral-800 flex justify-end gap-3">
             <Link 
               to="/assets"
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
               {isSubmitting ? "Saving..." : "Save Asset"}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}