import {model,Schema} from "mongoose"


const otpSchema = new Schema ({
    userId:{
        type:Schema.Types.ObjectId, 
        required:true
    },
    otp:{
        type:String,
        required:true,
        unique:true
    },
    createdAt:{ type: Date,  expires: 600 }
},{ timestamps: true })


const otp = model( 'Otp',otpSchema)
 export default otp