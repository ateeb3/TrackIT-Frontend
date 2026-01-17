import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Save, ArrowLeft, Package, AlignLeft } from "lucide-react";
import api from "../../api/axios";

interface CategoryFormData {
  name: string;
  description?: string;
}

export default function CategoryForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CategoryFormData>();
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      const response = await api.get(`/categories/${id}`);
      setValue("name", response.data.name);
      if (response.data.description) {
        setValue("description", response.data.description);
      }
    } catch (error) {
      toast.error("Failed to load category");
      navigate("/categories");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditMode) {
        await api.put(`/categories/${id}`, data);
        toast.success("Category updated");
      } else {
        await api.post("/categories", data);
        toast.success("Category created");
      }
      navigate("/categories");
    } catch (error: any) {
      console.error(error);
      toast.error("Operation failed");
    }
  };

  if (isLoading) return <div className="p-10 text-center text-neutral-400">Loading form...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/categories" className="p-2 rounded-lg bg-surface border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Category" : "New Category"}
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface border border-neutral-800 rounded-xl p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Category Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                {...register("name", { required: "Category Name is required" })}
                className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm placeholder-neutral-600"
                placeholder="e.g. Laptops"
              />
            </div>
            {errors.name && <p className="text-xs text-rose-400 ml-1">{errors.name.message}</p>}
          </div>

          {/* Optional Description Input (If your API supports it) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Description (Optional)</label>
            <div className="relative group">
              <div className="absolute top-3 left-3 pointer-events-none">
                <AlignLeft className="h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <textarea
                {...register("description")}
                rows={3}
                className="block w-full rounded-lg bg-background border border-neutral-700 text-white pl-10 pr-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm placeholder-neutral-600 resize-none"
                placeholder="Brief description of this category..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-neutral-800 flex justify-end gap-3">
             <Link 
               to="/categories"
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
               {isSubmitting ? "Saving..." : "Save Category"}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}