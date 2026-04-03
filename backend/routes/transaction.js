const express = require ("express");
const router= express.Router();

const authMiddleware=require("../middleware/authMiddleware");
const transactionContoller=require("../controllers/transactionController");

router.post("/",authMiddleware,transactionContoller.addTransaction);
router.get("/",authMiddleware,transactionContoller.getTransactions);
router.delete("/:id",authMiddleware,transactionContoller.deleteTransaction);
router.put("/:id", authMiddleware, transactionContoller.updateTransaction);
module.exports=router;

