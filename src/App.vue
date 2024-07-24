<template>
  <div id="app">
    <div class="container is-flex is-justify-content-space-between px-5 py-6 mb-6">
      <LiveTimestamp />
      <button @click="toggleDarkMode" class="button is-rounded">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>
    <div class="container px-5">
      <div class="columns is-desktop">
        <div class="column">
          <img alt="Vue logo" class="logo mx-auto wallet-logo" :class="logoClass(walletGenerated)" src="./assets/logo.png">
          <EthereumWallet ref="ethereumWallet" @addressChanged="updateRecipientAddress" @walletLoaded="walletGenerated = true" />
        </div>
        <div class="column">
          <img alt="Metamask logo" class="logo mx-auto metamask-logo" :class="logoClass(metamaskConnected)" src="./assets/metamask-logo.svg">
          <WalletConnect ref="walletConnect" 
            @walletConnected="onWalletConnected" 
            @walletDisconnected="metamaskConnected = false"
            :recipientAddress="recipientAddress" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import LiveTimestamp from './components/LiveTimestamp.vue'
import EthereumWallet from './components/EthereumWallet.vue'
import WalletConnect from './components/WalletConnect.vue'

declare global {
  interface Window {
    ethereum?: {
      isConnected(): boolean;
      request: (...args: any[]) => Promise<any>;
    }
  }
}

export default defineComponent({
  components: {
    LiveTimestamp,
    EthereumWallet,
    WalletConnect,
  },
  setup() {
    const recipientAddress = ref('')
    const walletGenerated = ref(false)
    const metamaskConnected = ref(false)
    const ethereumWallet = ref<InstanceType<typeof EthereumWallet> | null>(null)
    const isDark = ref(true) // Default to dark mode

    const applyTheme = () => {
      document.body.dataset.theme = isDark.value ? 'dark' : 'light'
    }

    const toggleDarkMode = () => {
      isDark.value = !isDark.value;
      applyTheme();
    }

    const updateRecipientAddress = () => {
      if (ethereumWallet.value) {
        recipientAddress.value = ethereumWallet.value.publicKey || ''
      }
    }

    const logoClass = (isActive: boolean) => ({
      'logo-fade': !isActive
    })

    const onWalletConnected = () => {
      metamaskConnected.value = true
    }

    onMounted(() => {
      // Check if MetaMask is already connected on page load
      if (window.ethereum && window.ethereum.isConnected()) {
        metamaskConnected.value = true
      }
      // Initial update of recipient address
      updateRecipientAddress()

      applyTheme()
    })

    return {
      recipientAddress,
      walletGenerated,
      metamaskConnected,
      updateRecipientAddress,
      logoClass,
      onWalletConnected,
      ethereumWallet,
      isDark,
      toggleDarkMode,
    }
  }
})
</script>

<style>
[data-theme="dark"] {
  --bulma-body-background-color: rgb(20,22,26);
  color: rgb(171,178,191);
}
[data-theme="light"] {
  --bulma-body-background-color: rgb(255,255,255);
  color: rgb(64,70,84);
}
body {
  background: var(--bulma-body-background-color);
  min-height: 100vh;
}
.logo {
  display: block;
  height: 200px;
  width: auto;
}
.logo-fade {
  filter: grayscale(1);
  opacity: 0.3;
}
</style>