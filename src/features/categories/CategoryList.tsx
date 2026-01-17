import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, Package, Pencil, Trash2 } from "lucide-react";
import api from "../../api/axios";

interface Category {
  id: number;
  name: string;
  description?: string; // Optional, in case your backend has it
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Are you sure? Deleting a category might affect assets assigned to it.")) return;

    // Optimistic update
    setCategories(categories.filter((c) => c.id !== id));

    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
      loadCategories(); // Revert
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Categories</h2>
          <p className="mt-1 text-sm text-neutral-400">Organize assets into groups.</p>
        </div>
        <Link 
          to="/categories/new" 
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary-900/20 hover:bg-primary-500 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Category
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-surface rounded-xl border border-neutral-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500 animate-pulse">Loading categories...</div>
        ) : (
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-surfaceHighlight">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 bg-surface">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-surfaceHighlight/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-primary-500/10 flex items-center justify-center text-primary-500 mr-3 border border-primary-500/20">
                        <Package size={16} />
                      </div>
                      <div className="text-sm font-medium text-white">{category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 font-mono">
                    #{category.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/categories/edit/${category.id}`} 
                      className="text-neutral-400 hover:text-primary-400 inline-block mr-4 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </Link>
                    <button 
                      onClick={() => deleteCategory(category.id)} 
                      className="text-neutral-400 hover:text-rose-400 inline-block transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-neutral-500">
                    No categories found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}