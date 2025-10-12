<script setup>

const balanceAmount = ref(null);

function updateBalanceAmount() {
  if (typeof window !== 'undefined') {
    const userInfoStr = localStorage.getItem('userInfo', '{}');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo) {
        balanceAmount.value = userInfo.amount;
      }
    }
  }
}
onMounted(async () => {
  updateBalanceAmount();
});

defineExpose({
  updateBalanceAmount,
});

</script>
<template>
  <div v-if="balanceAmount" class="pres-balance-amount"><span>Current Balance:</span> <span class='pres-balance-number'>${{ (balanceAmount/100).toFixed(2) }}</span></div>
</template>
