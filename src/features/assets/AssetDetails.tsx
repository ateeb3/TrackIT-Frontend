import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, User, Hash, Clock } from "lucide-react";
import api from "../../api/axios";
import clsx from "clsx";

export default function AssetDetails() {
  const { id } = useParams();
  const [asset, setAsset] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch Asset Details
      const assetRes = await api.get(`/assets/${id}`);
      if (!assetRes.data) throw new Error("Asset data is empty");
      setAsset(assetRes.data);

      // 2. Fetch History
      const historyRes = await api.get('/assignments');
      
      const rawHistory = Array.isArray(historyRes.data) 
        ? historyRes.data 
        : (historyRes.data.items || []);

      // Filter assignments for this asset
      const assetHistory = rawHistory
        .filter((h: any) => 
           // Handle string vs number comparison safely
           Number(h.assetId) === Number(id) || h.assetName === assetRes.data.name
        )
        .sort((a: any, b: any) => {
            const dateA = new Date(a.assignedDate).getTime();
            const dateB = new Date(b.assignedDate).getTime();
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });

      // --- DEBUGGING: Open your browser console (F12) to see this ---
      if (assetHistory.length > 0) {
        console.log("First History Item Data:", assetHistory[0]);
      }
      // -----------------------------------------------------------

      setHistory(assetHistory);

    } catch (err: any) {
      console.error("Crash prevented in AssetDetails:", err);
      setError("Failed to load asset details. Please check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString(undefined, { dateStyle: 'long' });
  };

  // Helper to safely get the user name regardless of casing
  const getUserName = (event: any) => {
    // Checks for userName, UserName, userEmail, UserEmail, or fallback
    return event.userName || event.UserName || event.userEmail || event.UserEmail || "Unknown User";
  };

  if (isLoading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Loading asset profile...</div>;
  if (error) return <div className="p-12 text-center text-rose-500">{error}</div>;
  if (!asset) return <div className="p-12 text-center text-neutral-400">Asset not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* --- Header --- */}
      <div className="flex items-center gap-4">
        <Link to="/assets" className="p-2 rounded-lg bg-surface border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {asset.name}
            <span className={clsx("px-3 py-1 rounded-full text-xs font-medium border", {
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': asset.status === 'Available',
                'bg-sky-500/10 text-sky-400 border-sky-500/20': asset.status === 'Assigned',
                'bg-amber-500/10 text-amber-400 border-amber-500/20': asset.status === 'Broken' || asset.status === 'InRepair',
                'bg-neutral-800 text-neutral-400 border-neutral-700': asset.status === 'Retired'
            })}>
               {asset.status}
            </span>
          </h1>
          <p className="text-sm text-neutral-400 font-mono mt-1">{asset.serialNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Left Column: Details Card --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-neutral-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-neutral-800 pb-2">Specs & Info</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase flex items-center gap-1 mb-1">
                  <Tag size={12} /> Category
                </label>
                <div className="text-neutral-200">{asset.categoryName || "Uncategorized"}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase flex items-center gap-1 mb-1">
                  <Hash size={12} /> Serial Number
                </label>
                <div className="text-neutral-200 font-mono bg-neutral-900 px-2 py-1 rounded w-fit text-sm">
                  {asset.serialNumber || "N/A"}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase flex items-center gap-1 mb-1">
                  <Calendar size={12} /> Purchased
                </label>
                <div className="text-neutral-200">
                  {formatDate(asset.purchaseDate)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column: Timeline --- */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-neutral-800 rounded-xl p-6 shadow-lg h-full">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Clock size={18} className="text-primary-500" />
              History Timeline
            </h3>

            {history.length === 0 ? (
              <div className="text-neutral-500 text-center py-10 italic">
                No assignment history found.
              </div>
            ) : (
              <div className="relative border-l border-neutral-800 ml-3 space-y-8">
                {history.map((event) => (
                  <div key={event.id} className="relative pl-8">
                    {/* Timeline Dot */}
                    <div className={clsx(
                      "absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2",
                      !event.returnDate ? "bg-sky-500 border-sky-900 shadow-[0_0_10px_rgba(14,165,233,0.5)]" : "bg-neutral-600 border-neutral-900"
                    )}></div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div>
                        <p className="text-white font-medium flex items-center gap-2">
                          {!event.returnDate ? "Checked Out to" : "Returned by"} 
                          <span className="text-primary-400 flex items-center gap-1">
                             <User size={14} /> 
                             {/* ✅ FIX: Robust check for Name */}
                             {getUserName(event)}
                          </span>
                        </p>
                        {event.notes && (
                           <p className="text-xs text-neutral-500 mt-1 italic">"{event.notes}"</p>
                        )}
                        {event.returnDate && (
                            <div className="mt-2">
                                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Condition: </span>
                                <span className="text-xs text-neutral-300">
                                    {event.returnStatus || "Good"}
                                </span>
                            </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-neutral-400">
                          {formatDate(event.assignedDate)} 
                          {event.returnDate && (
                            <span className="text-neutral-600 mx-1">➜</span>
                          )}
                          {event.returnDate && formatDate(event.returnDate)}
                        </div>
                        {event.returnDate ? (
                           <span className="text-[10px] text-neutral-600 uppercase tracking-widest font-semibold">Completed</span>
                        ) : (
                           <span className="text-[10px] text-sky-500 uppercase tracking-widest font-semibold animate-pulse">Active Now</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}