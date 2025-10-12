<script setup>
import { loadStripe } from '@stripe/stripe-js';
const props = defineProps({
  amount: { type: Number, required: true },
});


const paymentBalance = useTemplateRef('paymentBalance');
const config = useRuntimeConfig();
const {user} = await useUserSession();
const paymentContainer = useTemplateRef('payment-container');

// Accessing environment variables
const stripePk = config.public.STRIPE_PUBLIC_KEY;


const isProcessing = ref(false);
let stripe;
let elements;
let paymentElement;
let clientSecret;

onMounted(async () => {
  await initializeStripe();
  await updateUserInfo();
});

const initializeStripe = async () => {
  stripe = await loadStripe(stripePk);

  // Create a payment intent on your server
  const res = await fetch('/api/payment/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: props.amount // Fixed amount in cents
    })
  });

  const result = await res.json();
  clientSecret = result.client_secret;

  elements = stripe.elements({ clientSecret });

  // Create and mount the Payment Element
  paymentElement = elements.create('payment');
  paymentElement.mount(paymentContainer.value);

  isProcessing.value = false;
};

async function waitForUserBalanceChange(prevAmount) {
  let c = 0;
  while(c++ < 10) {
    const stop = await new Promise((resolve) => {
      setTimeout(async () => {
        const userInfo = await updateUserInfo();
        const stop =  (userInfo && userInfo.amount > prevAmount);
        return resolve(stop);
      }, 5000);
    });
    if (stop) {
      break;
    }
  }
}

const pay = async () => {
  isProcessing.value = true;
  const prevUserInfo = await updateUserInfo();
  try {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // return_url
        payment_method_data: {
          billing_details: {
            name: user?.name,
            email: user?.email,
          },
        },
      },
      redirect: 'if_required' // Stay on the same page unless redirect is necessary
    });

    if (error) {
      toast.error(`Payment error: ${error.message}`, error);
      isProcessing.value = false;
    } else {
      const succeededToast = toast.success('Payment succeeded');
      // Handle post-payment success actions, like showing a success message
      await waitForUserBalanceChange(prevUserInfo?.amount);
      paymentBalance.value.updateBalanceAmount();
      isProcessing.value = false;
      toast.remove(succeededToast);
    }
  } catch (error) {
    toast.error(`Payment processing error: ${error}`, error);
    isProcessing.value = false;
  }
};
</script>

<template>
  <div>
    <PaymentBalance ref="paymentBalance" />
    <!-- Payment form for Stripe Payment Element -->
    <form @submit.prevent="pay">
      <div id="payment-container" ref="payment-container" class="pres-dialog"></div>
      <button
        id="processing"
        :disabled="isProcessing"
        type="submit"
        class="pres-button"
        :class="isProcessing ? 'opacity-70' : 'opacity-100'"
        aria-label="loading"
      >
        <p v-if="isProcessing">Processing the payment</p>
        <div v-else>Buy Now</div>
      </button>
    </form>
  </div>
</template>

<style scoped>
/* Add any styles you want to apply to the purchase page */
</style>
