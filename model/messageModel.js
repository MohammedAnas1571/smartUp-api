import mongoose from 'mongoose'

const messageSchema = mongoose.Schema({
    chatID:{
        type: mongoose.Schema.Types.ObjectId,
    },
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
    },
    text:{
        String
}},{
    timeStamp:true
})
const messageModel =  mongoose.model("Message",messageSchema)
export default messageModel