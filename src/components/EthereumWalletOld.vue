<template>
  <div>
    <div>Public Key: {{ publicKey }}</div>
    <div v-if="balance !== null">Balance: {{ balance }} ETH</div>
    <button @click="generateWallet">Generate Wallet</button>
    <button @click="connectWallet">Connect WalletConnect</button>
    <button @click="connectMetaMask">Connect MetaMask</button>
    <button @click="sendTransaction" :disabled="!publicKey">Send Transaction</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { ethers } from 'ethers';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

export default defineComponent({
  name: 'EthereumWallet',
  setup() {
    const infuraKey = 'de0d3ed0cbe145ba960c1abd5d3a7411';
    const publicKey = ref<string | null>(null);
    const privateKey = ref<string | null>(null);
    const balance = ref<string | null>(null);
    const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${infuraKey}`);
    let web3: Web3 | null = null;

    const generateWallet = () => {
      const wallet = ethers.Wallet.createRandom();
      publicKey.value = wallet.address;
      privateKey.value = wallet.privateKey;
      sessionStorage.setItem('privateKey', privateKey.value);
      fetchBalance();
    };

    const fetchBalance = async () => {
      if (publicKey.value) {
        const bal = await provider.getBalance(publicKey.value);
        balance.value = ethers.formatEther(bal);
      }
    };

    const connectWallet = async () => {
      try {
        const walletConnectProvider = new WalletConnectProvider({
          rpc: {
            1: `https://mainnet.infura.io/v3/${infuraKey}`, // Mainnet RPC URL
          },
          chainId: 1, // Mainnet Chain ID
          qrcodeModalOptions: {
            mobileLinks: ["metamask", "trust"],
          },
        });
        
        await walletConnectProvider.enable();
        web3 = new Web3(walletConnectProvider as any);
        const accounts = await web3.eth.getAccounts();
        publicKey.value = accounts[0];
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User closed modal') {
          alert('Wallet connection modal was closed without connecting to a wallet. Please try again.');
        } else {
          console.error('An error occurred while connecting the wallet:', error);
          alert('An error occurred while connecting the wallet. Please try again.');
        }
      }
    };

    const connectMetaMask = async () => {
      if ((window as any).ethereum) {
        try {
          await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          web3 = new Web3((window as any).ethereum);
          const accounts = await web3.eth.getAccounts();
          publicKey.value = accounts[0];
        } catch (error) {
          console.error('User denied account access:', error);
          alert('User denied account access. Please try again.');
        }
      } else {
        console.log('MetaMask not detected');
        alert('MetaMask not detected. Please install MetaMask and try again.');
      }
    };

    const sendTransaction = async () => {
      if (!web3 || !publicKey.value) return;

      try {
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];

        const tx = {
          from: fromAddress,
          to: publicKey.value,
          value: web3.utils.toWei('0.01', 'ether'),
          gas: 21000,
        };

        await web3.eth.sendTransaction(tx);
      } catch (error) {
        console.error('An error occurred while sending the transaction:', error);
        alert('An error occurred while sending the transaction. Please try again.');
      }
    };

    watch(publicKey, fetchBalance);

    return {
      publicKey,
      balance,
      generateWallet,
      connectWallet,
      connectMetaMask,
      sendTransaction,
    };
  },
});
</script>

<style scoped>
div {
  margin-top: 20px;
}
button {
  margin-top: 10px;
  display: block;
}
</style>
