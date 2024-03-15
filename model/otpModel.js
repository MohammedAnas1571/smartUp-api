import {model,Schema} from "mongoose"


const otpSchema = new Schema ({
    userId:{
        type:Schema.Types.ObjectId, 
        ref:"User"
    },
    otp:{
        type:String,
        required:true,
        unique:true
    },
    // createdAt:{ type: Date,  expires: 300 }
},{ timestamps: true })


const otp = model( 'Otp',otpSchema)
 export default otp