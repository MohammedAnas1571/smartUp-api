
import mongoose, {model,Schema} from "mongoose"


const PurchaseSchema = new Schema ({
    userId: {type : mongoose.Types.ObjectId, ref:"User", required : true}, 
    courseId: { type: mongoose.Types.ObjectId ,ref:'Course' ,required:true},
    price: {type:Number,required:true},
},{timestamps:true})


const purchase = model( 'Purchase',PurchaseSchema 
)
 export default purchase
