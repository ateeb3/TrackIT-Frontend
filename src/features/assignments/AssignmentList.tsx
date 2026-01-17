import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, User, CornerDownLeft, Pencil, StickyNote } from "lucide-react"; // Added StickyNote
import api from "../../api/axios";
import Modal from "../../components/Model";

interface Assignment {
  id: number;
  assetName: string;
  userEmail: string;
  assignedDate: string;
  returnDate?: string | null;
  returnStatus?: string | null;
  notes?: string | null;
  assetId: number;
}

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Return Action Modal State ---
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [returnNote, setReturnNote] = useState("");
  const [returnCondition, setReturnCondition] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- View Note Modal State ---
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [viewNoteContent, setViewNoteContent] = useState("");

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await api.get('/assignments');
      setAssignments(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Open Return Action Modal
  const openReturnModal = (id: number) => {
    setSelectedId(id);
    setReturnNote("");
    setReturnCondition(1);
    setIsReturnModalOpen(true);
  };

  // 2. Open View Note Modal
  const openViewNoteModal = (note: string) => {
    setViewNoteContent(note);
    setIsNoteModalOpen(true);
  };

  // 3. Handle Return API Call
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    setIsSubmitting(true);
    try {
      await api.post(`/assignments/return`, { 
        assignmentId: selectedId,
        returnCondition: Number(returnCondition),
        notes: returnNote
      });
      
      toast.success("Asset returned successfully");
      setIsReturnModalOpen(false);
      loadAssignments();
    } catch (error) {
      console.error(error);
      toast.error("Failed to return asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Assignments</h2>
          <p className="mt-1 text-sm text-neutral-400">Track asset custody and history.</p>
        </div>
        <Link 
          to="/assignments/new" 
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary-900/20 hover:bg-primary-500 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={2.5} />
          New Assignment
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-surface rounded-xl border border-neutral-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500 animate-pulse">Loading history...</div>
        ) : (
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-surfaceHighlight">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Date Assigned</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 bg-surface">
              {assignments.map((assignment) => {
                const isActive = !assignment.returnDate;
                return (
                  <tr key={assignment.id} className="hover:bg-surfaceHighlight/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {assignment.assetName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2 text-sm text-neutral-300">
                          <User size={14} className="text-neutral-500" />
                          {assignment.userEmail}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                      {new Date(assignment.assignedDate).toLocaleDateString()}
                    </td>
                    
                    {/* Status Column with Note Icon */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-500 border border-neutral-700">
                                Returned
                            </span>
                            {/* If note exists, show icon button */}
                            {assignment.notes && (
                                <button 
                                    onClick={() => openViewNoteModal(assignment.notes!)}
                                    className="text-neutral-500 hover:text-primary-400 transition-colors p-1 rounded-md hover:bg-neutral-800"
                                    title="View Return Note"
                                >
                                    <StickyNote size={16} />
                                </button>
                            )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isActive && (
                        <button 
                          onClick={() => openReturnModal(assignment.id)}
                          className="text-primary-400 hover:text-primary-300 inline-flex items-center gap-1 mr-4 transition-colors"
                          title="Return Asset"
                        >
                          <CornerDownLeft size={16} /> Return
                        </button>
                      )}
                      <Link 
                        to={`/assignments/edit/${assignment.id}`} 
                        className="text-neutral-500 hover:text-white inline-block transition-colors"
                      >
                        <Pencil size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL 1: RETURN ASSET ACTION --- */}
      <Modal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} title="Return Asset">
        <form onSubmit={handleReturnSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Asset Condition</label>
                <select 
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(Number(e.target.value))}
                    className="w-full rounded-lg bg-background border border-neutral-700 text-white p-2.5 text-sm focus:ring-1 focus:ring-primary-500"
                >
                    <option value={1}>Available (Good Condition)</option>
                    <option value={3}>Broken (Needs Repair)</option>
                    <option value={4}>Retired (End of Life)</option>
                    <option value={5}>In Repair</option>
                </select>
                <p className="text-xs text-neutral-500 mt-1">This will update the asset's status in inventory.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Return Notes</label>
                <textarea 
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg bg-background border border-neutral-700 text-white p-2.5 text-sm focus:ring-1 focus:ring-primary-500 resize-none placeholder-neutral-600"
                    placeholder="e.g. Returned with original box..."
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <button 
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary-900/20 transition-all"
                >
                    {isSubmitting ? "Saving..." : "Confirm Return"}
                </button>
            </div>
        </form>
      </Modal>

      {/* --- MODAL 2: VIEW NOTE (READ ONLY) --- */}
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Return Note">
        <div className="bg-background/50 p-4 rounded-lg border border-neutral-800">
            <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                {viewNoteContent}
            </p>
        </div>
        <div className="mt-6 flex justify-end">
            <button
                onClick={() => setIsNoteModalOpen(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-neutral-700"
            >
                Close
            </button>
        </div>
      </Modal>

    </div>
  );
}