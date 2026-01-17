import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, Shield, Pencil, Trash2 } from "lucide-react";
import api from "../../api/axios";

interface User {
  id: string; // Identity uses Guid strings
  email: string;
  roles: string[];
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Assuming you have a UsersController with GET /api/users
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    // Optimistic Update
    setUsers(users.filter((u) => u.id !== id));

    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
    } catch (error) {
      toast.error("Failed to delete user");
      loadUsers(); // Revert
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Users</h2>
          <p className="mt-1 text-sm text-neutral-400">Manage system access and roles.</p>
        </div>
        <Link 
          to="/users/new" 
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary-900/20 hover:bg-primary-500 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add User
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-surface rounded-xl border border-neutral-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500 animate-pulse">Loading users...</div>
        ) : (
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-surfaceHighlight">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 bg-surface">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surfaceHighlight/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 mr-3 border border-primary-500/20 font-bold text-xs">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm font-medium text-white">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                        {user.roles && user.roles.map(role => (
                            <span key={role} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                role === 'Admin' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            }`}>
                                {role === 'Admin' && <Shield size={10} />}
                                {role}
                            </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/users/edit/${user.id}`} 
                      className="text-neutral-400 hover:text-primary-400 inline-block mr-4 transition-colors"
                    >
                      <Pencil size={18} />
                    </Link>
                    <button 
                      onClick={() => deleteUser(user.id)} 
                      className="text-neutral-400 hover:text-rose-400 inline-block transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}