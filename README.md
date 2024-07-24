# Blockchain Test Landing Page

This project is a simple Vue.js application designed as a landing page for testing blockchain transactions and wallet interactions. It supports generating Ethereum wallets, connecting with MetaMask, and sending transactions using WalletConnect.

## Features

- Live Timestamp: Displays the current date and time.
- Dark Mode Toggle: Users can switch between light and dark themes.
- Ethereum Wallet Generation: Generates a new Ethereum wallet and displays the public key.
- MetaMask Connection: Connects to MetaMask for wallet interactions.
- WalletConnect Integration: Enables connecting to various blockchain networks and sending transactions.

## Getting Started

To run the project locally, follow these steps:

1. Clone the repository:

  ```bash
  git clone https://github.com/BooleanWhale/blockchain-landing-page.git
  cd blockchain-landing-page
  ```

2. Install dependencies:

  ```bash
  npm install
  ```

3. Run the development server:

  ```bash
  npm run serve
  ```

4. Open http://localhost:8080 in your browser.

## Configuration

Modify the config.ts file to adjust settings such as the Infura key, currencies, and fetch intervals. Not that free infura accounts have limited fetch calls.
  ```javascript
  export const config = {
    projectId: 'your-walletconnect-project-id',
    infuraKey: 'your-infura-key',
    fetchBalancesInterval: 5000,
    currencies: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.infura.io/v3/your-infura-key',
        chainId: 1,
        explorerUrl: 'https://etherscan.io',
      },
      // Add other currencies as needed
    ],
  };
  ```

## How It Works

### Wallet Generation:

- Users can generate an Ethereum wallet using the EthereumWallet component.
- The wallet address is stored and used for transaction purposes.
- Wallet balances are fetched periodically.

### MetaMask and WalletConnect:

- The WalletConnect component allows users to connect their MetaMask or other wallets.
- Users can switch networks and send cryptocurrency to the generated wallet address.

### Theme Switching:

- Users can toggle between dark and light themes using a button in the UI.

## Technologies Used

- Vue.js 3: The progressive JavaScript framework for building UI.
- TypeScript: Strongly typed JavaScript for better code quality and maintainability.
- Ethers.js: A library for interacting with the Ethereum blockchain.
- WalletConnect: Protocol for connecting decentralized applications to mobile wallets with QR code scanning or deep linking.
- Infura: A service for connecting to the Ethereum network.

## Potential Limitations

- Network Dependencies: The app relies on Infura for Ethereum network interactions, which may have rate limits or downtime.
- Browser Compatibility: The app's functionality may vary based on browser extensions and settings, particularly regarding MetaMask.
- Security Considerations: The app logs private keys once for demonstration purposes, which is not secure for production use.

## Account Requirements

- MetaMask: Users need a MetaMask wallet extension installed in their browser.
- Infura Account: The app uses an Infura project ID for connecting to the Ethereum network.