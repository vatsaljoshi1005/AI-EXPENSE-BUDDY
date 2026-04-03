import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import ChatbotHomepage from './pages/chatpanel';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import FloatingAIButton from './components/FloatingAIButton';
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
  console.log("App component rendering!");
  return (
    <AuthProvider>
        <BrowserRouter>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                 <FloatingAIButton />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/chat" element={<ProtectedRoute><ChatbotHomepage/></ProtectedRoute>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
