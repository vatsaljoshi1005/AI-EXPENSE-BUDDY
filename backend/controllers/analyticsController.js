const mongoose=require("mongoose");
const Transaction=require("../models/Transaction");
exports.getPrediction = async (req, res) => {
    try {
        const userId = req.user.userId;

        const history = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: "expense"
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$paymentDate" },
                        month: { $month: "$paymentDate" }
                    },
                    totalExpense: { $sum: "$amount" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        // Extract only expense values
        const values = history.map(item => item.totalExpense);

        // Edge case: no data
        if (values.length === 0) {
            return res.json({ prediction: 0 });
        }

        // Take last 3 months
        const last3 = values.slice(-3);

        // Calculate average
        const avg = last3.reduce((a, b) => a + b, 0) / last3.length;

        // Add 10% growth (simple trend)
        const prediction = avg * 1.1;

        res.json({
            prediction: Math.round(prediction)
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMonthlyHistory=async(req,res)=>{
    try{
        const userId=req.user.userId;
        const data=await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: {
                        year: {$year: "$paymentDate"},
                        month: {$month: "$paymentDate"}
                    },
                    totalIncome: {
                        $sum: {
                            $cond: [
                                {$eq: ["$type","income"]},
                                "$amount",
                                0
                            ]
                        }
                    },
                    totalExpense:{
                        $sum: {
                            $cond: [
                                { $eq: ["$type","expense"]},
                                "$amount",
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);
        res.json(data);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

exports.getMonthlySummary = async(req,res)=>{
    try{
        const userId=req.user.userId;
        const now=new Date();
        const startOfMonth = new Date(now.getFullYear(),now.getMonth(),1);
        const endOfMonth=new Date(now.getFullYear(),now.getMonth()+1,0);

        const summary=await Transaction.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                paymentDate: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }   
            }
        },
        {
            $group: {
                _id: "$type",
                totalAmount: { $sum: "$amount" }
            }
        }
        ]);
        res.json(summary);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

exports.getCategoryBreakdown=async (req,res)=>{
    try{
        const userId=req.user.userId;
        const breakdown=await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: "expense"
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalAmount: {$sum: "$amount"}
                }
            }
        ]);
        res.json(breakdown);
        
    }catch(err){
        res.status(500).json({ error: err.message});
    }
};

exports.getFinancialScore = async (req,res)=>{
    try{
        const userId = req.user.userId;

        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month); // 0-11

        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        const result = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    paymentDate: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        let totalIncome = 0;
        let totalExpense = 0;

        result.forEach(item=>{
            if(item._id==="income") totalIncome=item.totalAmount;
            if(item._id==="expense") totalExpense=item.totalAmount;
        });

        const savings = totalIncome - totalExpense;
        const savingRate = totalIncome > 0 ? savings/totalIncome : 0;
        const financialScore = Math.min(Math.round(savingRate*100),100);

        res.json({
            totalIncome,
            totalExpense,
            savings,
            savingRate,
            financialScore
        });

    }catch(err){
        res.status(500).json({error:err.message});
    }
};

exports.getInsights=async(req,res)=>{
    try{
        const userId=req.user.userId;
        const result=await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: "$type",
                    totalAmount: {$sum: "$amount"}
                }
            }
        ]);
        let totalIncome=0;
        let totalExpense=0;
        result.forEach(item=>{
            if(item._id==="income") totalIncome=item.totalAmount;
            if(item._id==="expense") totalExpense=item.totalAmount;
        });

        const savings=totalIncome-totalExpense;
        const savingsRate=totalIncome>0? savings/totalIncome:0;
        const categories=await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: "expense"
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalAmount: {$sum: 
                        "$amount"
                    }
                }
            }
        ]);
        let insights=[];
        // 🔥 Rule 1: Savings check
        if (savingsRate < 0.1) {
            insights.push("⚠️ Your savings rate is very low. Try to reduce expenses.");
        } else if (savingsRate > 0.3) {
            insights.push("🔥 Great job! You have a strong savings habit.");
        }

        let maxCategory=null;
        let maxAmount=0;
        categories.forEach(cat=>{
            if(maxAmount< cat.totalAmount){
                maxAmount=cat.totalAmount;
                maxCategory=cat._id;
            }
        });
        if (maxCategory) {
            insights.push(`⚠️ You are spending most on ${maxCategory}. Consider optimizing it.`);
        }

        // 🔥 Rule 3: Overspending
        if (totalExpense > totalIncome) {
            insights.push("🚨 Your expenses exceed your income!");
        }

        // 🔥 Rule 4: Suggest saving
        if (totalIncome > 0) {
            const idealSaving = totalIncome * 0.2;
            const diff = idealSaving - savings;

            if (diff > 0) {
                insights.push(`💡 You can save ₹${Math.round(diff)} more to reach 20% savings.`);
            }
        }
        res.json({insights});
    }catch(err){
        res.status(500).json({error: err.message});
    }
};