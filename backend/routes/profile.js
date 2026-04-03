const express=require("express");
const router=express.Router();

const authMiddleware=require("../middleware/authMiddleware");
const profileController=require("../controllers/profileController");

router.post("/",authMiddleware,profileController.createProfile);

router.get("/",authMiddleware,profileController.getProfile);

router.put("/",authMiddleware,profileController.updateProfile);

module.exports=router;