import   mongoose, {Schema,model} from 'mongoose'

const courseSchema = new Schema({
    tutorId:{ type:mongoose.Types.ObjectId,
        required:true,ref:'Tutor'},
    title: {type : String , required : true},
    subTitle: {type:String,required:true},
    catagory: {type:String,required:true},
    tags: {type:String,required:true},
    level: { type: String, required: true },
     price: {type:Number,required:true},
     description: {type:String,required:true},
     content: {type:String,required:true},
     preview:{type:String,required:true},
     status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending'},
     image: {type:String,required:true},
     chapters:[
        { module:{
            type:String,
        },
        order: {
            type: Number,
        }, 
        videos:{
            type: String
        }
        }
     ],

},{timestamps:true})
const course = model("Course",courseSchema)
export default course
