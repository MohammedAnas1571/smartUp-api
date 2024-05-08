import "dotenv/config";
import Stripe from "stripe";

import Purchase from "../model/PurchaseModel.js";
import { Subscribed } from "../model/subscibedModel.js";
const stripe = Stripe(process.env.STRIPE_KEY);
let endpointSecret;
// endpointSecret = "whsec_8fe1e37467e40d3afe2a62581bbd39231779ce48e5e0113cc48fa246abe4500b";

export const stripePayment = async (product, res, userId) => {




  let line_items;
  let paymentMode;
  let successUrl;
  let cancelUrl;
  let metadataDetails

  let tenure = new Date();
  const date = new Date();

if (product.billingPeriod === "week") {
   tenure = new Date(
       date.getFullYear(),
       date.getMonth(),
       date.getDay() + 7
   );
}
if (product.billingPeriod === "month") {
   tenure = new Date(
       date.getFullYear(),
       date.getMonth() + 1,
       date.getDay()
   );
}

const expiry = tenure.toString();


  if (product.billingPeriod) {


    line_items = [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.planName,
            description: product.description,
          },
          unit_amount: product.price * 100,
          recurring: {
            interval: product.billingPeriod,
          },
          
        },
       
        quantity: 1,
      },
    ];

    paymentMode = "subscription";
    successUrl = `${process.env.ORIGIN}/instructor/subscription-success`;
    cancelUrl = `${process.env.ORIGIN}/instructor/subscription`
    
    metadataDetails = {
        userId: userId,
        subscription: product._id,
        type:"subscription",
        expires:expiry
    }
  

  } else {
    line_items = [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.title,
            description: product.description,
          },
          unit_amount: product.price * 100,
        },
        quantity: 1,
      },
    ];
    paymentMode = "payment";
    successUrl = `${process.env.ORIGIN}/success/${product._id}`;
    cancelUrl = `${process.env.ORIGIN}/payment/${product._id}`;
      metadataDetails = {
      userId,
      courseId: product._id,
      price: product.price,
      }

  }

      
  const customer = await stripe.customers.create({
    metadata:metadataDetails ,
    name: "Jhon",
    address: {
      city: "New York",
      country: "US",
      line1: "123 Main Street",
      line2: "Apt 4b",
      postal_code: "10001",
      state: "NY",
    },
  });  

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      customer: customer.id,
      mode: paymentMode,
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
  }
};

export const getEvent = async (req, res) => {
  let data;
  let eventType;
  const sig = req.headers["stripe-signature"];
  if (endpointSecret) {
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    data = event.data.object;
    eventType = event.type;
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
   
  }

  if (eventType === "checkout.session.completed") {
 
    try {
    
      const customer = await stripe.customers.retrieve(data.customer);
      console.log(customer.metadata)
      if(customer.metadata.type === "subscription"){
        await Subscribed.create ({
         userId:customer.metadata.userId,
         subscriptionId: customer.metadata.subscription,
         expireAt:customer.metadata.expires
   
        })
         }else{
          await Purchase.create({
            userId: customer.metadata.userId,
            courseId: customer.metadata.courseId,
            price: customer.metadata.price,
          });
         }
    } catch (err) {
      console.log(err.message);
    }
  }
  res.send().end();
};
