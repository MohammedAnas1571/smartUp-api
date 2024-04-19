import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    about:{
        type:String
    },
    profession:{
    type:String
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type:String,
        default: 'Tutor'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profilePhoto: {
        type: String,
        default: "https://www.pngitem.com/pimgs/m/22-223968_default-profile-picture-circle-hd-png-download.png"
    }
},{ timestamps: true });

const Tutor = mongoose.model("Tutor", tutorSchema);

export default Tutor;
