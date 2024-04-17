import mongoose from "mongoose";

const catagorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
})

const catagory = mongoose.model("Catagory", catagorySchema);
export default catagory