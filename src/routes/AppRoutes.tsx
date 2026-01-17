import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../features/auth/Login";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../features/dashboard/Dashboard";
import AssetList from "../features/assets/AssetList";
import AssetForm from "../features/assets/AssetForm";
import CategoryList from "../features/categories/CategoryList";
import CategoryForm from "../features/categories/CategoryForm";
import UserList from "../features/users/UserList";
import UserForm from "../features/users/UserForm";
import AssignmentList from "../features/assignments/AssignmentList";
import AssignmentForm from "../features/assignments/AssignmentForm";
import AssetDetails from "../features/assets/AssetDetails";
import Settings from "../features/settings/Settings";

// Guard Component: Redirects to login if no token
const ProtectedRoute = () => {
  const { token, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>; // Prevent flickering
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};


export default function AppRoutes() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/login" element={<Login />} />

      {/* --- PROTECTED ROUTES --- */}
      {/* Wrap everything in ProtectedRoute guard */}
      <Route element={<ProtectedRoute />}>
        
        {/* Wrap valid pages in MainLayout (Sidebar/Navbar) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Asset Routes */}
          <Route path="/assets" element={<AssetList />} />
          <Route path="/assets/new" element={<AssetForm />} />      {/* Create */}
          <Route path="/assets/edit/:id" element={<AssetForm />} />
          <Route path="/assets/:id" element={<AssetDetails />} />
          {/* Category Routes */}
           <Route path="/categories" element={<CategoryList />} />
           <Route path="/categories/new" element={<CategoryForm />} />
           <Route path="/categories/edit/:id" element={<CategoryForm />} />

           {/* User Management Routes */}
           <Route path="/users" element={<UserList />} />
           <Route path="/users/new" element={<UserForm />} />
           <Route path="/users/edit/:id" element={<UserForm />} />

           {/* Assignment Routes */}
          <Route path="/assignments" element={<AssignmentList />} />
          <Route path="/assignments/new" element={<AssignmentForm />} />
          <Route path="/assignments/edit/:id" element={<AssignmentForm />} />


          <Route path="/settings" element={<Settings />} />
          
          {/* Add more protected routes here later (e.g., /users, /assignments) */}
        </Route>
        

      </Route>

      {/* Catch-all: Redirect unknown URLs to login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}