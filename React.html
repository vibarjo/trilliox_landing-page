import React, { useState } from "react";

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        setError("");
      } catch (err) {
        setError("Connection request denied.");
      }
    } else {
      setError("MetaMask is not installed. Please install MetaMask and try again.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setError("");
  };

  return (
    <div style={{ padding: "1em", border: "1px solid #eee", borderRadius: "8px", maxWidth: "400px" }}>
      <h3>Connect Wallet</h3>
      {walletAddress ? (
        <div>
          <p><strong>Connected Address:</strong> {walletAddress}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect MetaMask</button>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default WalletConnect;
