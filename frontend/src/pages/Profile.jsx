import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, MapPin, DollarSign, Target, Home, Zap, ShoppingCart, Car, ShieldCheck, Edit3 } from 'lucide-react';

export default function Profile() {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        fullName: '',
        contact: '',
        address: '',
        monthlyIncome: '',
        savingGoal: '',
        housingBudget: '',
        utilitiesBudget: '',
        groceriesBudget: '',
        transportBudget: '',
        insuranceBudget: ''
    });

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/profile');
            if (res.data) {
                setProfile(res.data);
                const p = res.data;
                setFormData({
                    fullName: p.fullName || '',
                    contact: p.contact || '',
                    address: p.address || '',
                    monthlyIncome: p.monthlyIncome || '',
                    savingGoal: p.savingGoal || '',
                    housingBudget: p.housingBudget || '',
                    utilitiesBudget: p.utilitiesBudget || '',
                    groceriesBudget: p.groceriesBudget || '',
                    transportBudget: p.transportBudget || '',
                    insuranceBudget: p.insuranceBudget || ''
                });
            }
        } catch (error) {
            console.error("Profile fetch error", error);
            // Ignore 404, it means profile hasn't been created yet
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (profile) {
                await axios.put('/profile', formData);
                toast.success("Profile updated!");
            } else {
                await axios.post('/profile', formData);
                toast.success("Profile created!");
            }
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            toast.error("Failed to save profile");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    const readOnlyView = (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                
                <div className="w-32 h-32 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-5xl font-bold shadow-inner flex-shrink-0 z-10 border-4 border-white ring-1 ring-gray-100">
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-grow text-center md:text-left z-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile?.fullName || user?.username || 'Complete your profile'}</h2>
                    <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mb-4">
                        <User className="w-4 h-4" /> @{user?.username}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        {profile?.contact && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                                <Phone className="w-4 h-4 text-gray-400" /> {profile.contact}
                            </div>
                        )}
                        {profile?.address && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                                <MapPin className="w-4 h-4 text-gray-400" /> {profile.address}
                            </div>
                        )}
                    </div>
                </div>
                
                <button
                    onClick={() => setIsEditing(true)}
                    className="z-10 bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2"
                >
                    <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500" /> Financial Goals
                    </h3>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-green-100 text-green-600 rounded-xl"><DollarSign className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Monthly Income</p>
                                    <p className="font-bold text-xl text-gray-900">${profile?.monthlyIncome?.toLocaleString() || '0'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><Target className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Monthly Saving Goal</p>
                                    <p className="font-bold text-xl text-gray-900">${profile?.savingGoal?.toLocaleString() || '0'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Budget Allocation</h3>
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Home className="w-4 h-4" /></div>
                                <span className="font-medium text-gray-700">Housing</span>
                            </div>
                            <span className="font-bold text-gray-900">${profile?.housingBudget?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-50 text-yellow-500 rounded-lg"><Zap className="w-4 h-4" /></div>
                                <span className="font-medium text-gray-700">Utilities</span>
                            </div>
                            <span className="font-bold text-gray-900">${profile?.utilitiesBudget?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><ShoppingCart className="w-4 h-4" /></div>
                                <span className="font-medium text-gray-700">Groceries</span>
                            </div>
                            <span className="font-bold text-gray-900">${profile?.groceriesBudget?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><Car className="w-4 h-4" /></div>
                                <span className="font-medium text-gray-700">Transport</span>
                            </div>
                            <span className="font-bold text-gray-900">${profile?.transportBudget?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><ShieldCheck className="w-4 h-4" /></div>
                                <span className="font-medium text-gray-700">Insurance</span>
                            </div>
                            <span className="font-bold text-gray-900">${profile?.insuranceBudget?.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const editView = (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="border-b border-gray-100 pb-6 flex justify-between items-center sticky top-0 bg-white z-10 pt-2">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <div className="flex gap-3">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">Personal Details</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number</label>
                    <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">Financial Goals</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Income ($)</label>
                    <input type="number" required value={formData.monthlyIncome} onChange={e => setFormData({...formData, monthlyIncome: e.target.value})} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-semibold" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Saving Goal ($)</label>
                    <input type="number" required value={formData.savingGoal} onChange={e => setFormData({...formData, savingGoal: e.target.value})} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-semibold text-indigo-600" />
                </div>

                <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">Monthly Budgets</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Housing ($)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Home className="w-4 h-4 text-gray-400" /></div>
                        <input type="number" value={formData.housingBudget} onChange={e => setFormData({...formData, housingBudget: e.target.value})} className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Utilities ($)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Zap className="w-4 h-4 text-gray-400" /></div>
                        <input type="number" value={formData.utilitiesBudget} onChange={e => setFormData({...formData, utilitiesBudget: e.target.value})} className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Groceries ($)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ShoppingCart className="w-4 h-4 text-gray-400" /></div>
                        <input type="number" value={formData.groceriesBudget} onChange={e => setFormData({...formData, groceriesBudget: e.target.value})} className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Transport ($)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Car className="w-4 h-4 text-gray-400" /></div>
                        <input type="number" value={formData.transportBudget} onChange={e => setFormData({...formData, transportBudget: e.target.value})} className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Insurance ($)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ShieldCheck className="w-4 h-4 text-gray-400" /></div>
                        <input type="number" value={formData.insuranceBudget} onChange={e => setFormData({...formData, insuranceBudget: e.target.value})} className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                </div>
            </div>
        </form>
    );

    return (
        <div className="max-w-4xl mx-auto py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Profile Settings</h1>
            {isEditing ? editView : readOnlyView}
        </div>
    );
}
