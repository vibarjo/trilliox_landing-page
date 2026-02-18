// Wallet Variables
let provider = null;
let signer = null;
let userAddress = null;

// DOM Elements
const walletBtn = document.getElementById('wallet-btn');
const walletModal = document.getElementById('wallet-modal');
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const disconnectWalletBtn = document.getElementById('disconnect-wallet-btn');
const walletInfo = document.getElementById('wallet-info');
const errorMsg = document.getElementById('error-msg');

// Open Modal
walletBtn.addEventListener('click', () => {
    walletModal.classList.add('active');
});

// Close Modal on outside click
walletModal.addEventListener('click', (e) => {
    if (e.target === walletModal) {
        walletModal.classList.remove('active');
    }
});

// Check if MetaMask is available (works on mobile too)
function isMetaMaskAvailable() {
    if (window.ethereum) {
        return true;
    }
    return false;
}

// Connect Wallet Function
async function connectWallet() {
    try {
        // Check for MetaMask
        if (!window.ethereum) {
            showError('MetaMask not detected. Please install MetaMask browser or use MetaMask mobile app.');
            
            // Show install link
            const connectBtn = document.getElementById('connect-wallet-btn');
            connectBtn.textContent = 'Install MetaMask';
            connectBtn.onclick = () => {
                // Open MetaMask download page
                window.open('https://metamask.io/download/', '_blank');
            };
            return;
        }

        connectWalletBtn.textContent = 'Connecting...';
        connectWalletBtn.disabled = true;

        console.log('window.ethereum available:', window.ethereum);

        // Request accounts from MetaMask
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        console.log('Accounts received:', accounts);

        if (accounts.length === 0) {
            throw new Error('No accounts found. Please enable an account in MetaMask.');
        }

        userAddress = accounts[0];

        // Create provider using ethers.js
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = await provider.getSigner();

        // Get balance
        const balanceWei = await provider.getBalance(userAddress);
        const balance = ethers.utils.formatEther(balanceWei);

        // Get network
        const network = await provider.getNetwork();

        console.log('Connected address:', userAddress);
        console.log('Balance:', balance);
        console.log('Network:', network);

        // Update UI
        displayWalletInfo(userAddress, balance, network.chainId);
        walletBtn.textContent = `✓ ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        walletBtn.classList.add('connected');

        connectWalletBtn.style.display = 'none';
        disconnectWalletBtn.style.display = 'block';
        walletInfo.style.display = 'block';
        errorMsg.style.display = 'none';

    } catch (error) {
        console.error('Connection error:', error);
        
        if (error.code === 4001) {
            showError('Connection rejected. Please approve the request in MetaMask.');
        } else if (error.code === -32002) {
            showError('MetaMask request already pending. Please check MetaMask.');
        } else {
            showError(error.message || 'Failed to connect wallet');
        }
    } finally {
        connectWalletBtn.textContent = 'Connect MetaMask';
        connectWalletBtn.disabled = false;
    }
}

// Disconnect Wallet Function
function disconnectWallet() {
    provider = null;
    signer = null;
    userAddress = null;

    walletBtn.textContent = 'Connect Wallet';
    walletBtn.classList.remove('connected');

    connectWalletBtn.style.display = 'block';
    connectWalletBtn.textContent = 'Connect MetaMask';
    connectWalletBtn.onclick = connectWallet;
    disconnectWalletBtn.style.display = 'none';
    walletInfo.style.display = 'none';
    errorMsg.style.display = 'none';

    console.log('Wallet disconnected');
}

// Display Wallet Info
function displayWalletInfo(address, balance, chainId) {
    const networks = {
        1: 'Ethereum Mainnet',
        5: 'Goerli Testnet',
        11155111: 'Sepolia Testnet',
        137: 'Polygon',
        56: 'BSC Mainnet',
        43114: 'Avalanche C-Chain',
        250: 'Fantom Opera'
    };

    document.getElementById('wallet-address').textContent = address;
    document.getElementById('wallet-balance').textContent = `${parseFloat(balance).toFixed(4)} ETH`;
    document.getElementById('wallet-network').textContent = networks[chainId] || `Chain ID: ${chainId}`;
}

// Show Error
function showError(message) {
    errorMsg.innerHTML = `⚠️ ${message}`;
    errorMsg.style.display = 'block';
}

// Event Listeners
connectWalletBtn.addEventListener('click', connectWallet);
disconnectWalletBtn.addEventListener('click', disconnectWallet);

// Listen for account changes in MetaMask
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
            disconnectWallet();
            showError('MetaMask accounts disconnected');
        } else if (userAddress && accounts[0] !== userAddress) {
            console.log('Account switched');
            disconnectWallet();
            connectWallet();
        }
    });

    window.ethereum.on('chainChanged', () => {
        console.log('Chain changed');
        if (userAddress) {
            connectWallet();
        }
    });

    window.ethereum.on('disconnect', () => {
        console.log('Disconnected from MetaMask');
        disconnectWallet();
    });
}

// Check on page load if already connected
window.addEventListener('DOMContentLoaded', async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            if (accounts.length > 0) {
                userAddress = accounts[0];
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = await provider.getSigner();
                
                const balanceWei = await provider.getBalance(userAddress);
                const balance = ethers.utils.formatEther(balanceWei);
                const network = await provider.getNetwork();
                
                displayWalletInfo(userAddress, balance, network.chainId);
                walletBtn.textContent = `✓ ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
                walletBtn.classList.add('connected');
                
                connectWalletBtn.style.display = 'none';
                disconnectWalletBtn.style.display = 'block';
                walletInfo.style.display = 'block';
            }
        } catch (error) {
            console.log('Not connected yet');
        }
    }
});
