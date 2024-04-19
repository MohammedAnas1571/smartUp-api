
import {model,Schema} from "mongoose"


const chapterSchema = new Schema ({
    modules:{
        type:String,
        required:true
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





