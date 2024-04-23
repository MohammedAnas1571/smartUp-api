import "dotenv/config";
import Stripe from "stripe"

import Purchase from "../model/PurchaseModel.js";
const stripe = Stripe(process.env.STRIPE_KEY)
let endpointSecret;
// endpointSecret = "whsec_8fe1e37467e40d3afe2a62581bbd39231779ce48e5e0113cc48fa246abe4500b";

export const stripePayment =  async (course, res,userId) => {
  const customer = await stripe.customers.create({
    metadata:{
      userId,
      courseId:course._id,
      price:course.price
       
      },
      name: "Jhon", 
      address: { 
        city: "New York",
        country: "US",
        line1: "123 Main Street",
        line2: "Apt 4b",
        postal_code: "10001",
        state: "NY",
      },
  })
   
    const line_items = [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: course.title,
              description: course.description,
       
            },
            unit_amount: course.price*100, 
          },
          quantity: 1,
        },
      ];
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items,
          customer:customer.id,
          mode: 'payment',
          success_url: `${process.env.ORIGIN}/success/${course._id}`, 
          cancel_url: `${process.env.ORIGIN}/payment/${course._id}`,
       

        });
      
       return  res.json({ url: session.url });
      } catch (error) {
        
        console.error('Error creating Stripe session:', error);

      }

    };


   export const getEvent =  async (req,res) => {
    console.log("fisdhfuskdfsdf")
    let data;
     let eventType
    const sig = req.headers['stripe-signature'];
  if(endpointSecret){
    let event;
    
    try {
      console.log("12568656")
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
      console.log("verified")
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`)
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    data = event.data.object;
    eventType = event.type
  }else{
 
    data = req.body.data.object
    eventType = req.body.type
    console.log(eventType)

  }
  if(eventType === "checkout.session.completed"){
    try {
      const customer = await stripe.customers.retrieve(data.customer);
      console.log(customer.metadata.userId + "......" + customer.metadata.courseId);
      
       await Purchase.create({
        userId: customer.metadata.userId,
        courseId: customer.metadata.courseId,
        price:  customer.metadata.price,
       })
      
    } catch (err) {
      console.log(err.message);
    }
    
  }
  res.send().end();
}

    