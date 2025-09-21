import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CustomerProfile from "./pages/CustomerProfile";
import ProductListing from "./pages/ProductListing";
import CreatePost from "./pages/CreatePost";
import NotFound from "./pages/NotFound";
import ArtistDashboard from "./components/ArtistDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<ProductListing />} />
          
          {/* Protected routes for authenticated users */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <CustomerProfile />
            </ProtectedRoute>
          } />
          
          {/* Artist-only routes */}
          <Route path="/create" element={
            <ProtectedRoute requiredRole="artisan">
              <CreatePost />
            </ProtectedRoute>
          } />

          <Route path="/artistdashboard" element={
            <ProtectedRoute requiredRole="artisan">
              <ArtistDashboard />
            </ProtectedRoute>
          } />

          {/* IMPORTANT: DO NOT place any routes below this. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;