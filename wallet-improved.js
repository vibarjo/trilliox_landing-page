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
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');

// Detect device type
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Open Modal
walletBtn.addEventListener('click', () => {
    walletModal.classList.add('active');
    updateModalContent();
});

// Update modal based on device
function updateModalContent() {
    if (isMobileDevice()) {
        if (!window.ethereum) {
            modalTitle.textContent = 'Use MetaMask Mobile';
            modalDescription.innerHTML = `
                <strong>To connect your wallet on mobile:</strong><br><br>
                1. Install <a href="https://metamask.io/download/" target="_blank" style="color: #00ffea; text-decoration: underline;">MetaMask Mobile App</a><br>
                2. Open MetaMask and tap the menu icon<br>
                3. Select "Browser"<br>
                4. Paste this website URL<br>
                5. Click "Connect Wallet"
            `;
            connectWalletBtn.style.display = 'none';
        }
    }
}

// Close Modal on outside click
walletModal.addEventListener('click', (e) => {
    if (e.target === walletModal) {
        walletModal.classList.remove('active');
    }
});

// Connect Wallet Function
async function connectWallet() {
    try {
        // Check for MetaMask
        if (!window.ethereum) {
            if (isMobileDevice()) {
                showError('Please open this website in MetaMask mobile browser');
                return;
            } else {
                showError('MetaMask extension not found. Installing from Chrome Web Store...');
                connectWalletBtn.textContent = 'Install MetaMask';
                connectWalletBtn.onclick = () => {
                    window.open('https://metamask.io/download/', '_blank');
                };
                return;
            }
        }

        connectWalletBtn.textContent = 'Connecting...';
        connectWalletBtn.disabled = true;

        console.log('MetaMask detected, requesting accounts...');

        // Request accounts
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        console.log('✓ Connected accounts:', accounts);

        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        userAddress = accounts[0];

        // Create provider
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = await provider.getSigner();

        // Get balance
        const balanceWei = await provider.getBalance(userAddress);
        const balance = ethers.utils.formatEther(balanceWei);

        // Get network
        const network = await provider.getNetwork();

        console.log('✓ Address:', userAddress);
        console.log('✓ Balance:', balance, 'ETH');
        console.log('✓ Network:', network.name);

        // Update UI
        displayWalletInfo(userAddress, balance, network.chainId);
        walletBtn.textContent = `✓ ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        walletBtn.classList.add('connected');

        connectWalletBtn.style.display = 'none';
        disconnectWalletBtn.style.display = 'block';
        walletInfo.style.display = 'block';
        errorMsg.style.display = 'none';
        modalTitle.textContent = 'Wallet Connected!';
        modalDescription.innerHTML = `Your wallet has been successfully connected to NYVRIX`;

    } catch (error) {
        console.error('❌ Connection error:', error);
        
        if (error.code === 4001) {
            showError('You rejected the connection request');
        } else if (error.code === -32002) {
            showError('A connection request is already pending in MetaMask');
        } else {
            showError(error.message || 'Failed to connect wallet');
        }
    } finally {
        connectWalletBtn.textContent = 'Connect MetaMask';
        connectWalletBtn.disabled = false;
    }
}

// Disconnect Wallet
function disconnectWallet() {
    provider = null;
    signer = null;
    userAddress = null;

    walletBtn.textContent = 'Connect Wallet';
    walletBtn.classList.remove('connected');

    connectWalletBtn.style.display = 'block';
    connectWalletBtn.textContent = 'Connect MetaMask';
    disconnectWalletBtn.style.display = 'none';
    walletInfo.style.display = 'none';
    errorMsg.style.display = 'none';

    modalTitle.textContent = 'Connect Your Wallet';
    modalDescription.textContent = 'Link MetaMask to access NYVRIX features';

    console.log('Wallet disconnected');
}

// Display Wallet Info
function displayWalletInfo(address, balance, chainId) {
    const networks = {
        1: 'Ethereum Mainnet',
        5: 'Goerli Testnet',
        11155111: 'Sepolia Testnet',
        137: 'Polygon Mainnet',
        80001: 'Polygon Mumbai',
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

// Listen for MetaMask events
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Account changed:', accounts);
        if (accounts.length === 0) {
            disconnectWallet();
        }
    });

    window.ethereum.on('chainChanged', () => {
        console.log('Chain changed');
        location.reload();
    });

    window.ethereum.on('disconnect', () => {
        console.log('Disconnected from MetaMask');
        disconnectWallet();
    });
}

// Auto-connect on page load
window.addEventListener('load', async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            if (accounts.length > 0) {
                console.log('Auto-connecting to previous session...');
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
    } else if (isMobileDevice()) {
        console.log('Mobile device detected without MetaMask');
    }
});
