import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, ChevronLeft, ChevronRight, Download } from "lucide-react"; // Added Download icon
import clsx from "clsx";
import api from "../../api/axios";
import { exportToCSV } from "../../utils/exportUtils"; // Import the utility

// Types
interface Asset {
  id: number;
  name: string;
  serialNumber: string;
  categoryName: string;
  status: string;
  purchaseDate: string;
}

export default function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Pagination State
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Dropdown Options
  const statusOptions = [
    { label: 'Available', value: 1 },
    { label: 'Assigned', value: 2 },
    { label: 'Broken', value: 3 },
    { label: 'Retired', value: 4 },
    { label: 'In Repair', value: 5 }
  ];

  useEffect(() => {
    loadAssets();
  }, [currentPage]);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/assets?search=${searchText}&page=${currentPage}&pageSize=${pageSize}`);
      const data = response.data.items || response.data.Items || [];
      const count = response.data.totalCount || response.data.TotalCount || 0;
      setAssets(data);
      setTotalItems(count);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadAssets();
  };

  // --- NEW EXPORT FUNCTION ---
  const handleExport = () => {
    if (assets.length === 0) {
      toast.info("No assets to export.");
      return;
    }

    const dataToExport = assets.map(a => ({
        ID: a.id,
        Name: a.name,
        SerialNumber: a.serialNumber,
        Category: a.categoryName,
        Status: a.status,
        Purchased: new Date(a.purchaseDate).toLocaleDateString()
    }));
    exportToCSV(dataToExport, "TrackIT_Assets");
  };

  const deleteAsset = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    setAssets(assets.filter((a) => a.id !== id));
    try {
      await api.delete(`/assets/${id}`);
      toast.success("Asset deleted");
    } catch (error) {
      toast.error("Delete failed");
      loadAssets();
    }
  };

  const updateStatus = async (assetId: number, newStatusValue: number) => {
    const newLabel = statusOptions.find(o => o.value === newStatusValue)?.label || 'Unknown';
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: newLabel } : a));
    try {
      await api.patch(`/assets/${assetId}/status`, { status: newStatusValue });
      toast.success(`Updated to ${newLabel}`);
    } catch (error) {
      toast.error("Update failed");
      loadAssets();
    }
  };

  const getStatusValue = (label: string) => {
    return statusOptions.find(o => o.label === label)?.value || 1;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Assets</h2>
          <p className="mt-1 text-sm text-neutral-400">Manage hardware inventory.</p>
        </div>
        
        {/* Action Buttons Group */}
        <div className="flex gap-3">
            {/* Export Button */}
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-surface px-4 py-2 text-sm font-bold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
            >
                <Download size={18} />
                Export
            </button>

            {/* Add Asset Button */}
            <Link 
            to="/assets/new" 
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary-900/20 hover:bg-primary-500 transition-all hover:-translate-y-0.5"
            >
            <Plus size={18} strokeWidth={2.5} />
            Add Asset
            </Link>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <input 
            type="text" 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search assets..." 
            className="block w-full rounded-lg bg-surface border border-neutral-700 text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm px-4 py-2"
          />
        </div>
        <button type="submit" className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Search
        </button>
      </form>

      {/* Table Card */}
      <div className="bg-surface rounded-xl border border-neutral-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500 animate-pulse">Loading assets...</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-neutral-800">
              <thead className="bg-surfaceHighlight">
                <tr>
                  {["Asset Name", "Serial #", "Category", "Status", "Purchase Date", "Actions"].map((head) => (
                    <th key={head} className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-surface">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-surfaceHighlight/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {/* Wrap the name in a Link to Details Page */}
                        <Link to={`/assets/${asset.id}`} className="hover:text-primary-400 hover:underline transition-colors">
                            {asset.name}
                        </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400 font-mono">
                      {asset.serialNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                      {asset.categoryName}
                    </td>
                    
                    {/* Status Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <div className="relative w-36">
                        <select 
                          value={getStatusValue(asset.status)}
                          onChange={(e) => updateStatus(asset.id, Number(e.target.value))}
                          className={clsx(
                            "w-full appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-bold border-0 ring-1 ring-inset focus:ring-2 focus:ring-primary-500 transition-all text-center",
                            {
                              'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30': asset.status === 'Available',
                              'bg-sky-500/10 text-sky-400 ring-sky-500/30': asset.status === 'Assigned',
                              'bg-amber-500/10 text-amber-400 ring-amber-500/30': asset.status === 'Broken' || asset.status === 'InRepair',
                              'bg-neutral-800 text-neutral-500 ring-neutral-700': asset.status === 'Retired'
                            }
                          )}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-surface text-neutral-200">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                      {new Date(asset.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/assets/edit/${asset.id}`} className="text-primary-400 hover:text-primary-300 mr-4 font-semibold transition-colors">
                        Edit
                      </Link>
                      <button onClick={() => deleteAsset(asset.id)} className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4 bg-surfaceHighlight/20">
              <span className="text-sm text-neutral-500">
                Page {currentPage} of {Math.ceil(totalItems / pageSize)}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-1 border border-neutral-700 rounded-lg hover:bg-neutral-700 disabled:opacity-50 text-sm text-neutral-300 transition-colors"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  disabled={(currentPage * pageSize) >= totalItems}
                  className="flex items-center px-3 py-1 border border-neutral-700 rounded-lg hover:bg-neutral-700 disabled:opacity-50 text-sm text-neutral-300 transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}