
// Get DOM elements
const statusEl = document.getElementById('status');
const descEl = document.getElementById('description');
const connectBtn = document.getElementById('connect-btn');
const accountEl = document.getElementById('account-display');

// Check if MetaMask is installed
function isMetaMaskInstalled() {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
}

// Initial check on page load
function initWalletCheck() {
    if (!isMetaMaskInstalled()) {
        statusEl.textContent = 'Install MetaMask';
        descEl.textContent = 'You need MetaMask to connect to Genesis Ledger.';
        connectBtn.textContent = 'Install MetaMask';
        connectBtn.onclick = () => {
            window.open('https://metamask.io/download/', '_blank');
        };
    } else {
        // Check if already connected
        checkConnected().then((accounts) => {
            if (accounts.length > 0) {
                showAccount(accounts[0]);
            } else {
                statusEl.textContent = 'Connect Your Wallet';
                descEl.textContent = 'Click below to link MetaMask.';
                connectBtn.textContent = 'Connect MetaMask';
                connectBtn.onclick = connectWallet;
            }
        });
    }
}

// Check for existing connection
async function checkConnected() {
    const { ethereum } = window;
    if (ethereum) {
        return await ethereum.request({ method: 'eth_accounts' });
    }
    return [];
}

// Connect function
async function connectWallet() {
    const { ethereum } = window;
    if (!ethereum) return;

    connectBtn.disabled = true;
    connectBtn.textContent = 'Connecting...';

    // Optional: Show a simple spinner
    const spinner = document.createElement('div');
    spinner.className = 'loading';
    descEl.appendChild(spinner);

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
            showAccount(accounts[0]);
        }
    } catch (error) {
        console.error('Connection failed:', error);
        statusEl.textContent = 'Connection Failed';
        descEl.textContent = 'Please try again or check your MetaMask.';
        connectBtn.disabled = false;
        connectBtn.textContent = 'Retry Connect';
    } finally {
        connectBtn.disabled = false;
        if (spinner) spinner.remove();
    }
}

// Display connected account
function showAccount(address) {
    statusEl.textContent = 'Wallet Connected!';
    descEl.textContent = 'Welcome to Genesis Ledger.';
    connectBtn.style.display = 'none'; // Hide button after connect

    accountEl.style.display = 'block';
    accountEl.innerHTML = `
        <strong>Address:</strong> ${address.substring(0, 6)}...${address.substring(38)} 
        <span style="color: green;">✓</span>
    `;
}

// Listen for account changes (e.g., if user switches wallets)
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // Re-prompt connection
            location.reload();
        } else {
            showAccount(accounts[0]);
        }
    });
}

// Start the app
initWalletCheck();
