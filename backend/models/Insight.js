const mongoose=require("mongoose");

const insightSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

    type:{
        type: String,
        enum: ["recommendation","anomaly","forecast","financialScore"],
        required: true
    },

    message: {
        type: String,
        required: true
    },

    score: {
        type: Number
    }

}, {timestamps: true});
module.exports=mogoose.model("Insight",insightSchema);