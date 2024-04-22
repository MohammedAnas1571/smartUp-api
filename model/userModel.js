import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    role:{
        type:String,
        default: 'User'
    },
   
    password: {
        type: String,
        required: true
    },
    isBlocked:{
        type:Boolean,
        default:false

    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profilePhoto: {
        type: String,
        default: "https://www.pngitem.com/pimgs/m/22-223968_default-profile-picture-circle-hd-png-download.png"
    },
    purchasedCourses:[{
        type: mongoose.Types.ObjectId, 
        ref:"Courses"
    }]
},{ timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
