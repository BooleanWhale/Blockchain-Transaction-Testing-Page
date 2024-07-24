<template>
  <div class="mt-5 mb-6">
    <w3m-button class="mt-5"/>
    <div v-for="currency in config.currencies" :key="currency.symbol">
      <input class="input is-primary mt-5" v-model="amounts[currency.symbol]" type="number" min="0" step="0.001">
      <button class="button is-primary mt-5" @click="() => handleSendClick(currency)" :disabled="!isConnected">
        Send {{ amounts[currency.symbol] }} {{ currency.symbol }} to Generated Wallet
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, reactive } from 'vue'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/vue'
import { ethers } from 'ethers'
import { config, CurrencyConfig } from '../config'

export default defineComponent({
  props: {
    recipientAddress: {
      type: String,
      required: true
    }
  },
  emits: ['walletConnected', 'walletDisconnected'],
  setup(props, { emit }) {
    const projectId = config.projectId

    const metadata = { 
      name: 'My Website',
      description: 'My Website description',
      url: 'http://localhost/',
      icons: ['https://avatars.mywebsite.com/']
    }

    const ethersConfig = defaultConfig({
      metadata,
      defaultChainId: config.currencies[0].chainId,
    })

    // Adds WalletConnect modals from currencies set in config.ts
    createWeb3Modal({
      ethersConfig,
      chains: config.currencies.map(c => ({
        chainId: c.chainId,
        name: c.name,
        currency: c.symbol,
        explorerUrl: c.explorerUrl,
        rpcUrl: c.rpcUrl
      })),
      projectId,
      themeMode: 'dark'
    })

    const { isConnected, address } = useWeb3ModalAccount()
    const web3modal = useWeb3Modal()

    const amounts = reactive(Object.fromEntries(
      config.currencies.map(c => [c.symbol, 0.001])
    ))

    onMounted(() => {
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

    const handleSendClick = async (currency: CurrencyConfig) => {
      if (!isConnected.value) {
        await web3modal.open()
      }
      if (isConnected.value) {
        await sendToGeneratedWallet(props.recipientAddress, currency)
      } else {
        console.error('Wallet not connected')
      }
    }

    // Change blockchain network
    const switchToNetwork = async (currency: CurrencyConfig) => {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Failed to detect window.ethereum')
      }
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${currency.chainId.toString(16)}` }],
        })
        console.log(`Switched to ${currency.name} network`)
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${currency.chainId.toString(16)}`,
                chainName: currency.name,
                nativeCurrency: {
                  name: currency.name,
                  symbol: currency.symbol,
                  decimals: 18
                },
                rpcUrls: [currency.rpcUrl],
                blockExplorerUrls: [currency.explorerUrl]
              }]
            })
            await switchToNetwork(currency)
          } catch (addError) {
            console.error(`Failed to add ${currency.name} network:`, addError)
          }
        } else {
          console.error(`Failed to switch to ${currency.name} network:`, switchError)
        }
      }
    }

    const sendToGeneratedWallet = async (recipientAddress: string, currency: CurrencyConfig) => {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed!')
      }

      try {
        await switchToNetwork(currency)

        const amountToSend = amounts[currency.symbol]
        const amountInWei = ethers.parseEther(amountToSend.toString()).toString(16)

        const transactionParameters = {
          to: recipientAddress,
          from: address.value,
          value: '0x' + amountInWei,
          chainId: `0x${currency.chainId.toString(16)}`
        }

        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        })

        alert(`Transaction sent: ${txHash}`);
      } catch (error: any) {
        if (error.code === 4001) {
          alert('Metamask closed without completing transaction')
        } else {
          console.error('Error sending transaction:', error)
          alert('An error occurred while sending the transaction')
        }
      }
    }

    return {
      amounts,
      isConnected,
      handleSendClick,
      sendToGeneratedWallet,
      config
    }
  }
})
</script>