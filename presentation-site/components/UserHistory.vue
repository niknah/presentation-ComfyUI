<script setup>

const history = ref([]);

async function loadHistory() {
  if (typeof window !== 'undefined') {
    const url = '/api/userHistory';
    const historyResp = await fetch(url);
    history.value = await historyResp.json();
  }
}

onMounted(async () => {
  await loadHistory();
});

</script>
<template>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Item</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(hist, idx) in history">
        <td>{{ new Date(hist.date).toLocaleString() }}</td>
        <td>{{ hist.source || hist.prompt_id }}</td>
        <td>${{ (hist.amount/100).toFixed(2) }}</td>
      </tr>
    </tbody>
  </table>
</template>
