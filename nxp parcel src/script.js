// Import the ethers.js library
import { ethers } from 'ethers';

// Set up provider and signer
let provider;
let signer;
let userAddress;

// Function to connect wallet
async function connectWallet() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        console.log('Connected to wallet:', userAddress);
    } else {
        console.log('Please install MetaMask!');
    }
}

// Function to fetch balance
async function fetchBalance() {
    if (userAddress) {
        const balance = await provider.getBalance(userAddress);
        console.log('Balance:', ethers.utils.formatEther(balance), 'ETH');
    } else {
        console.log('No wallet connected. Please connect your wallet first.');
    }
}

// Function to detect network
async function detectNetwork() {
    if (provider) {
        const network = await provider.getNetwork();
        console.log('Network:', network.name);
    }
}

// Function to disconnect wallet
function disconnectWallet() {
    provider = null;
    signer = null;
    userAddress = null;
    console.log('Disconnected from wallet.');
}

// Example usage
connectWallet();
fetchBalance();
detectNetwork();
// Call disconnectWallet() whenever you need to disconnect