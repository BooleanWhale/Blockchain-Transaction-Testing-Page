<template>
  <div class="mt-5">
    <div>Public Key: {{ publicKey }}</div>
    <div v-for="balance in balances" :key="balance.symbol">
      {{ balance.name }} Balance: {{ balance.amount }} {{ balance.symbol }}
    </div>
    <button class="button is-primary is-dark mt-5" @click="generateWallet">Generate Wallet</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { ethers } from 'ethers';
import { config, CurrencyConfig } from '../config';

interface BalanceInfo {
  name: string;
  symbol: string;
  amount: string;
}

export default defineComponent({
  name: 'EthereumWallet',
  emits: ['addressChanged', 'walletLoaded'],
  setup(props, { emit }) {
    const publicKey = ref<string | null>(null);
    const privateKey = ref<string | null>(null);
    const balances = ref<BalanceInfo[]>([]);

    // Generate new wallet using Ethers
    const generateWallet = () => {
      const wallet = ethers.Wallet.createRandom();
      publicKey.value = wallet.address;
      privateKey.value = wallet.privateKey;
      sessionStorage.setItem('publicKey', publicKey.value);
      sessionStorage.setItem('privateKey', privateKey.value);
      fetchBalances();
      emit('addressChanged', publicKey.value);
      emit('walletLoaded');
    };

    // Fetch generated wallet balance using Infura
    const fetchBalances = async () => {
      if (publicKey.value) {
        balances.value = await Promise.all(
          config.currencies.map(async (currency: CurrencyConfig) => {
            // eslint-disable-next-line
            const balance = await currency.provider.getBalance(publicKey.value!);
            return {
              name: currency.name,
              symbol: currency.symbol,
              amount: ethers.formatEther(balance)
            };
          })
        );
      }
    };

    // Get previously generated wallet on refresh
    const loadWalletFromStorage = () => {
      const storedPublicKey = sessionStorage.getItem('publicKey');
      const storedPrivateKey = sessionStorage.getItem('privateKey');
      if (storedPublicKey && storedPrivateKey) {
        publicKey.value = storedPublicKey;
        privateKey.value = storedPrivateKey;
        fetchBalances();
        emit('addressChanged', publicKey.value);
        emit('walletLoaded');
      }
    };

    watch(publicKey, fetchBalances);

    onMounted(() => {
      loadWalletFromStorage();
      setInterval(fetchBalances, config.fetchBalancesInterval);
    });

    return {
      publicKey,
      balances,
      generateWallet,
    };
  },
});
</script>