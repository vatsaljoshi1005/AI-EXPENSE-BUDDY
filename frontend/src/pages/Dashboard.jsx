import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    Wallet, TrendingUp, TrendingDown,
    Target, Zap, AlertCircle
} from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [summary, setSummary] = useState(null);
    const [score, setScore] = useState(null);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [insights,setInsights]=useState([]);

    useEffect(() => {

        const fetchDashboardData = async () => {
            try {
                const year = selectedDate.getFullYear();
                const month = selectedDate.getMonth();

                const [
                    summaryRes,
                    scoreRes,
                    transactionsRes,
                    predictionRes,
                    insightsRes
                ] = await Promise.all([
                    axios.get(`/analytics/monthly-summary?year=${year}&month=${month}`),
                    axios.get(`/analytics/financial-score?year=${year}&month=${month}`),
                    axios.get('/transactions'),
                    axios.get('/analytics/prediction'),
                    axios.get('/analytics/insights')
                ]);

                // SUMMARY
                const summaryData = summaryRes.data;

                let income = 0;
                let expense = 0;

                summaryData.forEach(item => {
                    if (item._id === "income") income = item.totalAmount;
                    if (item._id === "expense") expense = item.totalAmount;
                });

                setSummary({
                    totalIncome: income,
                    totalExpense: expense,
                    balance: income - expense,
                    month: selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                });

                // SCORE
                setScore(scoreRes.data.financialScore);

                // ✅ AI PREDICTION
                setPrediction(predictionRes.data.prediction);

                // CATEGORY BREAKDOWN
                const txs = transactionsRes.data;

                const filteredTx = txs.filter(tx => {
                    const txDate = new Date(tx.paymentDate);
                    return (
                        txDate.getFullYear() === year &&
                        txDate.getMonth() === month
                    );
                });

                const expenses = filteredTx.filter(t => t.type === 'expense');

                const categoryTotals = expenses.reduce((acc, curr) => {
                    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                    return acc;
                }, {});

                const pieData = Object.keys(categoryTotals).map(category => ({
                    name: category,
                    value: categoryTotals[category]
                }));

                setCategoryBreakdown(pieData);
                setInsights(insightsRes.data.insights);

            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }

        };

        fetchDashboardData();

    }, [selectedDate]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    const { totalIncome = 0, totalExpense = 0, balance = 0, month } = summary || {};
    const savingsRate = totalIncome > 0
        ? ((totalIncome - totalExpense) / totalIncome) * 100
        : 0;

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                    <p className="text-gray-500">
                        Your financial status for {month || 'this month'}
                    </p>
                </div>

                <div className="flex items-center gap-4">

                    {/* Month Picker */}
                    <input
                        type="month"
                        value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
                        onChange={(e) => {
                            const [year, month] = e.target.value.split("-");
                            setSelectedDate(new Date(year, month - 1));
                        }}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />

                    {/* Financial Score */}
                    {score !== null && (
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${score >= 70 ? 'bg-green-100 text-green-600' :
                                    score >= 40 ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-red-100 text-red-600'
                                }`}>
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Financial Score</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {score.toFixed(1)} / 100
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* Balance */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                            Balance
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                        ₹{balance.toLocaleString()}
                    </h3>
                </div>

                {/* Income */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                            Income
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                        ₹{totalIncome.toLocaleString()}
                    </h3>
                </div>

                {/* Expense */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                            Expense
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                        ₹{totalExpense.toLocaleString()}
                    </h3>
                </div>

                {/* 🔥 AI Forecast */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Target className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                            AI Forecast
                        </span>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            Next Month Expense
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900">
                            ₹{prediction ? prediction.toLocaleString() : "0"}
                        </h3>
                    </div>
                </div>

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
            <div className="h-72 flex items-center justify-center text-gray-400">
                No expense data
            </div>
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
{/* AI INSIGHTS */}
<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-indigo-500" />
        AI Insights
    </h3>

    {insights.length > 0 ? (
        <div className="space-y-4">
            {insights.map((insight, index) => (
                <div
                    key={index}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3"
                >
                    <span className="text-xl">🤖</span>
                    <p className="text-gray-700 font-medium">{insight}</p>
                </div>
            ))}
        </div>
    ) : (
        <p className="text-gray-400">No insights available</p>
    )}
</div>


        </div>
    );
}