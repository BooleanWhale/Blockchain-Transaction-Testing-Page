<template>
  <div>
    <h3>Send Transaction</h3>
    <div>Recipient: {{ recipientAddress }}</div>
    <input v-model="amount" type="text" placeholder="Amount in tXR" />
    <button @click="sendTransaction">Send Transaction</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TransactionForm',
  props: {
    recipientAddress: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const amount = ref('');

    const sendTransaction = () => {
      emit('sendTransaction', amount.value);
    };

    return {
      amount,
      sendTransaction
    };
  }
});
</script>