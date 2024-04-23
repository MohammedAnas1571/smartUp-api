
import {model,Schema} from "mongoose"


const chapterSchema = new Schema ({
    name:{
        type:String,
        required:true
    },
    courseId:{
        type:Schema.Types.ObjectId,ref:"Course",required:true
    },
    order: {
        type: Number,
        required:true
    }, 
    videoUrl:{
        type: String,
        required:true
    }
})


const chapter = model( 'Chapters',chapterSchema)
 export default chapter





