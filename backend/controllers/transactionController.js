const Transaction = require("../models/Transaction");

exports.addTransaction = async (req,res) => {
    try{
        const { type, amount, category, description, paymentDate, paymentMethod } = req.body;

        const transaction = new Transaction({
            userId: req.user.userId,
            type,
            amount, 
            category,
            description,
            paymentDate,
            paymentMethod
        });
        await transaction.save();

        res.status(201).json({
            msg: "Transaction added successfully",
            transaction
        });
    }catch(err){
        res.status(500).json({
            error: err.message
        });
    }
};

exports.getTransactions = async (req,res) => {
    try{
        const transactions=await Transaction.find({
            userId: req.user.userId
        }).sort({paymentDate: -1});

        res.status(200).json(transactions);

    }catch(err){
        res.status(500).json({
            error: err.message
        });
    }
};

exports.deleteTransaction = async (req,res) => {
    try{
        const transaction=await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if(!transaction){
            return res.status(404).json({msg: "Transaction not found"});
        }
        res.json({msg: "Transaction deleted successfully"});
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

exports.updateTransaction = async (req,res) => {
    try{

        const transaction = await Transaction.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.userId
            },
            req.body,
            { returnDocument: "after" }
        );

        if(!transaction){
            return res.status(404).json({msg: "Transaction not found"});
        }

        res.json({
            msg: "Transaction updated successfully",
            transaction
        });

    }catch(err){
        res.status(500).json({error: err.message});
    }
};