import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    Wallet, TrendingUp, TrendingDown,
    Target, Zap, Bell, X
} from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
    const [selectedMonth, setSelectedMonth] = useState(
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    );
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, month: '' });
    const [score, setScore] = useState(0);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [prediction, setPrediction] = useState(0);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentTx, setRecentTx] = useState([]);
    const [showAlertModal, setShowAlertModal] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setSummary({ totalIncome: 0, totalExpense: 0, balance: 0, month: '' });
            setScore(0);
            setCategoryBreakdown([]);
            setPrediction(0);
            setInsights([]);

            try {
                const [year, month] = selectedMonth.split("-");

                const [
                    summaryRes,
                    scoreRes,
                    transactionsRes,
                    predictionRes,
                    insightsRes
                ] = await Promise.all([
                    axios.get(`/analytics/monthly-summary?year=${year}&month=${month}`),
                    axios.get(`/analytics/financial-score?year=${year}&month=${month}`),
                    axios.get(`/transactions?year=${year}&month=${month}`),
                    axios.get(`/analytics/prediction?year=${year}&month=${month}`),
                    axios.get(`/analytics/insights?year=${year}&month=${month}`)
                ]);

                // --- SUMMARY ---
                const summaryData = summaryRes.data;
                let income = 0, expense = 0;
                summaryData.forEach(item => {
                    if (item._id === "income") income = item.totalAmount;
                    if (item._id === "expense") expense = item.totalAmount;
                });

                const displayMonth = new Date(Number(year), Number(month) - 1)
                    .toLocaleString('default', { month: 'long', year: 'numeric' });

                setSummary({
                    totalIncome: income,
                    totalExpense: expense,
                    balance: income - expense,
                    month: displayMonth
                });

                // --- FINANCIAL SCORE ---
                setScore(scoreRes.data.financialScore || 0);

                // --- AI PREDICTION ---
                setPrediction(predictionRes.data.prediction || 0);

                // --- CATEGORY BREAKDOWN ---
                const expenses = transactionsRes.data.filter(tx => tx.type === 'expense');
                const categoryTotals = expenses.reduce((acc, curr) => {
                    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                    return acc;
                }, {});
                setCategoryBreakdown(Object.keys(categoryTotals).map(key => ({
                    name: key,
                    value: categoryTotals[key]
                })));

                // --- INSIGHTS ---
                setInsights(insightsRes.data.insights || []);

                // --- ALERTS TRIGGER ---
                const todayMidnight = new Date();
                todayMidnight.setHours(0,0,0,0);
                const yesterdayMidnight = new Date(todayMidnight);
                yesterdayMidnight.setDate(todayMidnight.getDate() - 1);

                const recent = transactionsRes.data.filter(tx => new Date(tx.paymentDate) >= yesterdayMidnight);
                setRecentTx(recent);

                if (!sessionStorage.getItem("dashboardAlertShown") && (insightsRes.data.insights?.length > 0 || recent.length > 0)) {
                    setShowAlertModal(true);
                    sessionStorage.setItem("dashboardAlertShown", "true");
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedMonth]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    const { totalIncome, totalExpense, balance, month } = summary;

    return (
        <div className="space-y-6">

            {/* ALERT MODAL */}
            {showAlertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white flex justify-between items-center shadow-inner">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Bell className="w-5 h-5 animate-bounce" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Welcome Back!</h3>
                            </div>
                            <button onClick={() => setShowAlertModal(false)} className="text-white/70 hover:text-white transition-transform hover:scale-110 bg-white/10 p-2 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-7 bg-slate-50/50">
                            {/* Insights alert */}
                            {insights.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Latest Insight</h4>
                                    <div className="bg-white shadow-sm border border-indigo-100 rounded-2xl p-4 text-indigo-800 text-sm font-medium leading-relaxed relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                        💡 {insights[0]}
                                    </div>
                                </div>
                            )}

                            {/* Recent transactions */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Recent Activity</h4>
                                {recentTx.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {recentTx.slice(0, 3).map((tx, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3.5 bg-white shadow-sm rounded-2xl border border-slate-100/80">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${tx.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                                    <span className="font-bold text-slate-700 capitalize text-[15px]">{tx.category}</span>
                                                </div>
                                                <span className={`font-bold text-[15px] ${tx.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                                                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-slate-400 text-sm font-medium bg-white p-5 rounded-2xl border border-dashed border-slate-200 text-center shadow-sm">
                                        No recent transactions. Add one to keep tracking!
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setShowAlertModal(false)} className="w-full py-4 mt-2 bg-indigo-600 text-white rounded-2xl font-bold text-[15px] hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                Awesome, let's go!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                    <p className="text-gray-500">Your financial status for {month || 'this month'}</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Month Picker */}
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />

                    {/* Financial Score */}
                    <div className={`bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3`}>
                        <div className={`p-2 rounded-lg ${score >= 70 ? 'bg-green-100 text-green-600' :
                            score >= 40 ? 'bg-yellow-100 text-yellow-600' :
                                'bg-red-100 text-red-600'
                            }`}>
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Financial Score</p>
                            <p className="text-xl font-bold text-gray-900">{score.toFixed(1)} / 100</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { key: 'balance', label: 'Balance', value: balance, icon: <Wallet className="w-6 h-6" />, bg: 'bg-indigo-50', color: 'text-indigo-600' },
                    { key: 'income', label: 'Income', value: totalIncome, icon: <TrendingUp className="w-6 h-6" />, bg: 'bg-green-50', color: 'text-green-600' },
                    { key: 'expense', label: 'Expense', value: totalExpense, icon: <TrendingDown className="w-6 h-6" />, bg: 'bg-red-50', color: 'text-red-600' },
                    { key: 'forecast', label: 'AI Forecast', value: prediction, icon: <Target className="w-6 h-6" />, bg: 'bg-purple-50', color: 'text-purple-600' }
                ].map(card => (
                    <div key={card.key} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 ${card.bg} ${card.color} rounded-xl`}>{card.icon}</div>
                            <span className={`text-sm font-medium ${card.color} ${card.bg} px-2.5 py-1 rounded-full`}>{card.label}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">₹{card.value.toLocaleString()}</h3>
                    </div>
                ))}
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Expense Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-500" /> Expense Breakdown
                    </h3>
                    {categoryBreakdown.length > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryBreakdown.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-gray-400">No expense data</div>
                    )}
                </div>

                {/* Cash Flow */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" /> Cash Flow Summary
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{ name: 'Overview', Income: totalIncome, Expense: totalExpense }]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `₹${value}`} />
                                <Tooltip formatter={(value) => `₹${value}`} />
                                <Bar dataKey="Income" fill="#10b981" />
                                <Bar dataKey="Expense" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-500" /> AI Insights
                </h3>
                {insights.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {insights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-indigo-500">•</span>
                                <span>{insight}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No insights available for this month.</p>
                )}
            </div>

        </div>
    );
}