import Stripe from 'stripe';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await getUserSession(event);
  const userId = getUserFolder(session);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(body.amount), // Amount in cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: userId,
      }
    });

    return {
      client_secret: paymentIntent.client_secret
    };
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating payment intent',
    });
  }
});
