import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Wallet, BarChart3, Menu, X, Bot } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
                        <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl text-gray-900 tracking-tight">ExpenseBuddy</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
                        <BarChart3 className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/transactions" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
                        <Wallet className="w-4 h-4" /> Transactions
                    </Link>
                    <Link to="/chat" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
                        <Bot className="w-4 h-4" /> FinChat
                    </Link>
                    <Link to="/profile" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
                        <User className="w-4 h-4" /> Profile
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>

                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900">
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden border-t py-4 px-4 flex flex-col gap-4 bg-white">
                    <Link to="/dashboard" className="text-gray-700 font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
                    <Link to="/transactions" className="text-gray-700 font-medium" onClick={() => setIsOpen(false)}>Transactions</Link>
                    <Link to="/chat" className="text-gray-700 font-medium" onClick={() => setIsOpen(false)}>FinChat</Link>
                    <Link to="/profile" className="text-gray-700 font-medium" onClick={() => setIsOpen(false)}>Profile</Link>
                    <button onClick={handleLogout} className="text-left text-red-600 font-medium">Logout</button>
                </div>
            )}
        </nav>
    );
}
