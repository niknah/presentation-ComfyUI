<script setup>
const route = useRoute();
const amount = ref(route.query.amount || 2000);
</script>
<template>
  <div>
    <h1>Purchase ${{ Number(amount/100).toFixed(2) }}</h1>
    <div>
    </div>

    <PaymentStripe :amount="amount" />

    <PresentationLogin />
  </div>
</template>
