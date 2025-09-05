import stripe from 'stripe';
import Booking from '../models/Booking.js';
import { inngest } from '../inngest/index.js';

export const stripeWebhooks = async (request, response)=>{
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        console.error('Webhook signature verification failed:', error.message);

        return response.status(400).send(`Webhook Error: ${error.message}`);

    }
    try {
        switch (event.type) {
            case "checkout.session.completed":{
                
                const session = event.data.object;
                
                console.log('Checkout session completed:', session.id);

                const bookingId = session.metadata?.bookingId;
                console.log("bookingId from metadata:", bookingId);
                if(!bookingId){
                    console.error('No bookingId found in session metadata');
                    break;
                }
                const updatedBooking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { isPaid: true, paymentLink: ''},
                    { new: true }
                );
                
                if(updatedBooking){
                    console.log(`Booking ${bookingId} marked as paid`);
                }
                else{
                    console.error(`Booking not found: ${bookingId}`);
                }

                //Send Confirmation Email

                await inngest.send({
                    name: "app/show.booked",
                    data: {bookingId}
                })

                break;

            }
        
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        response.json({ received:true });
    } catch (err) {
        console.error("Webhook processing error:", err);
        response.status(500).send("Internal Server Error");
    }

};

