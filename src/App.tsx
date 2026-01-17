import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes"; // <--- Import the new file

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="bottom-right" />
        <AppRoutes /> 
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;