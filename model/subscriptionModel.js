import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: true
    },
   
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    billingPeriod: {
        type: String,
        required:true,
        enum: ['week','month']
    }
})



const subscriptionModel = mongoose.model('Subscription',subscriptionSchema);

export { subscriptionModel as Subscription };