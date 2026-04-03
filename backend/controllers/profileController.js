const Profile = require("../models/Profile");
exports.createProfile = async (req,res) =>{
    try{
        const userId=req.user.userId;
        const existingProfile=await Profile.findOne({userId});
        if(existingProfile){
            return res.status(400).json({msg: "Profile already exists"});
        }
        const profile=new Profile({
            userId,
            ...req.body
        });
        await profile.save();
        res.status(201).json(profile);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

exports.getProfile=async (req,res) =>{
    try{
        const userId=req.user.userId;
        const profile=await Profile.findOne({userId});

        if(!profile){
            return res.status(404).json({msg: "Profile not found"});
        }
        res.json(profile);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

exports.updateProfile=async (req,res) =>{
    try{
        const userId=req.user.userId;
        const profile=await Profile.findOneAndUpdate(
            {userId},
            req.body,
            {returnDocument: "after"}
        );
        if(!profile){
            return res.status(404).json({msg: "Profile not found"});
        }
        res.json(profile);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};