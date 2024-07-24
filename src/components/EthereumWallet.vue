<template>
  <div class="mt-5 mb-6">
    <div>Public Key: {{ publicKey }}</div>
    <div v-if="ethBalance !== null">ETH Balance: {{ ethBalance }} ETH</div>
    <div v-if="txrBalance !== null">tXR Balance: {{ txrBalance }} tXR</div>
    <button class="button is-primary is-dark mt-5" @click="generateWallet">Generate Wallet</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { ethers } from 'ethers';

export default defineComponent({
  name: 'EthereumWallet',
  emits: ['addressChanged', 'walletLoaded'],
  setup(props, { emit }) {
    const infuraKey = 'de0d3ed0cbe145ba960c1abd5d3a7411';
    const publicKey = ref<string | null>(null);
    const privateKey = ref<string | null>(null);
    const ethBalance = ref<string | null>(null);
    const txrBalance = ref<string | null>(null);
    const ethProvider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${infuraKey}`);
    const xrSepoliaProvider = new ethers.JsonRpcProvider('https://xr-sepolia-testnet.rpc.caldera.xyz/http');

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

    const fetchBalances = async () => {
      if (publicKey.value) {
        const ethBal = await ethProvider.getBalance(publicKey.value);
        ethBalance.value = ethers.formatEther(ethBal);

        const txrBal = await xrSepoliaProvider.getBalance(publicKey.value);
        txrBalance.value = ethers.formatEther(txrBal);
      }
    };

    const loadWalletFromStorage = () => {
      const storedPublicKey = sessionStorage.getItem('publicKey');
      const storedPrivateKey = sessionStorage.getItem('privateKey');
      if (storedPublicKey && storedPrivateKey) {
        publicKey.value = storedPublicKey;
        privateKey.value = storedPrivateKey;
        fetchBalances();
        emit('addressChanged', publicKey.value);
        emit('walletLoaded');
        console.log(publicKey.value, privateKey.value);
      }
    };

    watch(publicKey, fetchBalances);

    onMounted(() => {
      loadWalletFromStorage();
      setInterval(fetchBalances, 10000000);
    });

    return {
      publicKey,
      ethBalance,
      txrBalance,
      generateWallet,
    };
  },
});
</script>