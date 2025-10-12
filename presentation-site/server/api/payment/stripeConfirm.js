import Stripe from 'stripe';

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event, false);
  const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET_KEY);
  const signature = getHeader(event, 'stripe-signature')

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_KEY
    )
    const object = stripeEvent?.data?.object;
    // const billingDetails = object?.charges?.data?.[0]?.billing_details;
    const userId = object?.metadata?.user_id;
    const paymentIntentId = object.id;
    let amount = object?.amount;

    console.log('user paid', userId, amount);
    const usersDB = new UsersDB();
    const result = await usersDB.addPaymentAmount(
      userId, paymentIntentId, 
      { type: "deposit", source: "stripe", object },
      amount
    );
    if (!result) {
      console.warn('Payment has already been done', paymentIntentId);
    }

    if (result?.modifiedCount !== 1) {
      console.error('Did not replace user', result, userId);
    }
    return {
      ok: true,
    };
  } catch (err) {
    console.error('stripe.webhook error', err);
    const error = createError({
      statusCode: 400,
      statusMessage: `Webhook error: ${err}`,
    })
    return sendError(event, error)
  }
});
