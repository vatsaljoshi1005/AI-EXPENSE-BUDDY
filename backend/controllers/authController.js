const User=require("../models/User");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

exports.registerUser=async(req,res)=>{
    try{
        const {username, email, password}=req.body;
        const existingUser=await User.findOne({username});

        if(existingUser){
            return res.status(400).json({msg: "Username already taken"});
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser=new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({
            msg: "User registered successfully!",
            user: { id: newUser._id, username: newUser.username, email: newUser.email }
        });
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

exports.loginUser=async(req,res)=>{
    try{
        const {username,password}=req.body;
        const user=await User.findOne({username});
        if(!user){
            return res.status(400).json({msg: "Invalid credentials"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({msg: "Invalid credentials"});
        }
        const token=jwt.sign(
            {userId: user._id, username: user.username},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );
        res.status(200).json({
            msg: "Login successful",
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });

    }catch(err){
        res.status(500).json({error: err.message});
    }
};
