import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, ArrowUpRight, ArrowDownRight, Calendar, Tag, Filter } from 'lucide-react';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModaling, setIsModaling] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'

    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        isForecast: false
    });

    const fetchTransactions = async () => {
        try {
            const res = await axios.get('/transactions');
            setTransactions(res.data);
        } catch (error) {
            toast.error("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTx) {
                await axios.put(`/transactions/${editingTx._id}`, formData);
                toast.success("Transaction updated!");
            } else {
                await axios.post('/transactions', formData);
                toast.success("Transaction added!");
            }
            setIsModaling(false);
            setEditingTx(null);
            resetForm();
            fetchTransactions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save transaction");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            try {
                await axios.delete(`/transactions/${id}`);
                toast.success("Transaction deleted!");
                fetchTransactions();
            } catch (error) {
                toast.error("Failed to delete");
            }
        }
    };

    const openEditModal = (tx) => {
        setEditingTx(tx);
        setFormData({
            type: tx.type,
            amount: tx.amount,
            category: tx.category,
            description: tx.description || '',
            paymentDate: new Date(tx.paymentDate).toISOString().split('T')[0],
            paymentMethod: tx.paymentMethod || 'Cash',
            isForecast: tx.isForecast || false
        });
        setIsModaling(true);
    };

    const resetForm = () => {
        setFormData({
            type: 'expense',
            amount: '',
            category: '',
            description: '',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Cash',
            isForecast: false
        });
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        return tx.type === filter;
    });

    const commonCategories = formData.type === 'expense' 
        ? ['Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Other']
        : ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-gray-500">Manage your income and expenses</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingTx(null); setIsModaling(true); }}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" /> Add Transaction
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                        <button 
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilter('income')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Income
                        </button>
                        <button 
                            onClick={() => setFilter('expense')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Expense
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-64 text-gray-400">
                            <Filter className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-lg font-medium text-gray-500">No transactions found</p>
                            <p className="text-sm">Click 'Add Transaction' to get started</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-4 font-medium">Type</th>
                                    <th className="px-6 py-4 font-medium">Description</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                                    <th className="px-6 py-4 font-medium text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg flex-shrink-0 ${tx.type === 'income' ? 'bg-green-100/50 text-green-600' : 'bg-red-100/50 text-red-600'}`}>
                                                    {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                </div>
                                                <span className="capitalize font-medium text-gray-700">{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{tx.description || '-'}</div>
                                            {tx.paymentMethod && <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Tag className="w-3 h-3" /> {tx.paymentMethod}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(tx.paymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold text-lg ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                            {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(tx)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(tx._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModaling && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">{editingTx ? 'Edit Transaction' : 'Add Transaction'}</h2>
                            <button onClick={() => setIsModaling(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="flex gap-4">
                                <label className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'expense' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                    <input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={(e) => setFormData({...formData, type: 'expense', category: ''})} className="hidden" />
                                    <ArrowDownRight className="w-6 h-6 mb-1" />
                                    <span className="font-semibold text-sm">Expense</span>
                                </label>
                                <label className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'income' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                    <input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={(e) => setFormData({...formData, type: 'income', category: ''})} className="hidden" />
                                    <ArrowUpRight className="w-6 h-6 mb-1" />
                                    <span className="font-semibold text-sm">Income</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg font-medium"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                                >
                                    <option value="" disabled>Select a category</option>
                                    {commonCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="E.g., Groceries at Walmart"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.paymentDate}
                                        onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                                    <select
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Online">Online</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Debit Card">Debit Card</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModaling(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
                                >
                                    {editingTx ? 'Update Transaction' : 'Save Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
