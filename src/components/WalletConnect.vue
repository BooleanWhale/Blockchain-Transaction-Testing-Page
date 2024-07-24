<template>
  <div class="mt-5 mb-6">
    <w3m-button class="mt-5"/>
    <input class="input is-primary mt-5" v-model="amount" type="number" min="0" step="0.001">
    <button class="button is-primary mt-5" @click="handleSendClick" :disabled="!isConnected">
      Send {{ amount }} tXR to Generated Wallet
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/vue'
import { ethers } from 'ethers'

export default defineComponent({
  props: {
    recipientAddress: {
      type: String,
      required: true
    }
  },
  emits: ['walletConnected', 'walletDisconnected'],
  setup(props, { emit }) {
    const projectId = 'f9069c33af4d95ec6408040046120239'

    const xrSepolia = {
      chainId: 1440002,
      name: 'XR Sepolia',
      currency: 'tXR',
      explorerUrl: 'https://explorer.xrpl.org',
      rpcUrl: 'https://xr-sepolia-testnet.rpc.caldera.xyz/http'
    }

    const metadata = { 
      name: 'My Website',
      description: 'My Website description',
      url: 'http://localhost/',
      icons: ['https://avatars.mywebsite.com/']
    }

    const ethersConfig = defaultConfig({
      metadata,
      defaultChainId: 1440002,
    })

    createWeb3Modal({
      ethersConfig,
      chains: [xrSepolia],
      projectId,
      themeMode: 'light'
    })

    const { isConnected, address } = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()
    const web3modal = useWeb3Modal()

    const amount = ref(0.001)
    const recipientAddress = ref('')

    onMounted(() => {
      // Check if wallet is already connected on mount
      if (isConnected.value) {
        emit('walletConnected')
      }
    })

    watch(isConnected, (newValue) => {
      if (newValue) {
        emit('walletConnected')
      } else {
        emit('walletDisconnected')
      }
    })

    onMounted(async () => {
      const wallet = ethers.Wallet.createRandom()
      recipientAddress.value = await wallet.getAddress()
    })

    const handleSendClick = async () => {
      if (!isConnected.value) {
        await web3modal.open()
      }
      if (isConnected.value) {
        await sendToGeneratedWallet(props.recipientAddress)
      } else {
        console.error('Wallet not connected')
      }
    }

    const xrSepoliaChainId = '0xaaa' // 2730 in decimal

    const addXrSepoliaNetwork = async () => {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed!');
      }
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: xrSepoliaChainId,
            chainName: 'XR Sepolia',
            nativeCurrency: {
              name: 'Test XRP',
              symbol: 'tXR',
              decimals: 18
            },
            rpcUrls: ['https://xr-sepolia-testnet.rpc.caldera.xyz/http'],
            blockExplorerUrls: ['https://explorer.xrpl.org']
          }]
        })
        console.log('XR Sepolia network added to MetaMask')
      } catch (error) {
        console.error('Failed to add XR Sepolia network:', error)
      }
    }

    const switchToXrSepolia = async () => {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed!');
      }
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: xrSepoliaChainId }],
        })
        console.log('Switched to XR Sepolia network')
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          await addXrSepoliaNetwork()
          await switchToXrSepolia()
        } else {
          console.error('Failed to switch to XR Sepolia network:', switchError)
        }
      }
    }

    const sendToGeneratedWallet = async (recipientAddress: string) => {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed!')
      }

      try {
        // Ensure we're on the XR Sepolia network
        await switchToXrSepolia()

        const amountToSend = amount.value
        const amountInWei = ethers.parseEther(amountToSend.toString()).toString(16) // Convert to hex

        const transactionParameters = {
          to: recipientAddress,
          from: address.value, // Use the connected address
          value: '0x' + amountInWei, // Prefix with '0x'
          chainId: xrSepoliaChainId
        }

        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        })

        console.log('Transaction sent:', txHash)
        // Note: MetaMask will handle the transaction confirmation
      } catch (error) {
        console.error('Error sending transaction:', error)
        throw error
      }
    }

    return {
      amount,
      isConnected,
      handleSendClick,
      sendToGeneratedWallet
    }
  }
})
</script>