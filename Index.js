import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositValue, setDepositValue] = useState(1); // Initial deposit value
  const [withdrawValue, setWithdrawValue] = useState(1); // Initial withdraw value
  const [pendingTransaction, setPendingTransaction] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // Current date and time
  const [nickname, setNickname] = useState(""); // State for the nickname

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      setPendingTransaction(true);
      let tx = await atm.deposit(depositValue);
      // User will be prompted by MetaMask to confirm the transaction
      await tx.wait();
      setPendingTransaction(false);
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      if (withdrawValue <= balance) {
        setPendingTransaction(true);
        let tx = await atm.withdraw(withdrawValue);
        // User will be prompted by MetaMask to confirm the transaction
        await tx.wait();
        setPendingTransaction(false);
        getBalance();
      } else {
        alert("You don't have enough balance to withdraw this amount");
      }
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Click here to Open</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Ticket Price: 100 </p>
        <p>Your Balance: {balance}</p>
        <input
          type="number"
          value={depositValue}
          onChange={(e) => setDepositValue(parseFloat(e.target.value))}
          placeholder="Deposit Amount"
        />
        <button onClick={deposit} disabled={pendingTransaction}>Top-Up</button>
        <input
          type="number"
          value={withdrawValue}
          onChange={(e) => setWithdrawValue(parseFloat(e.target.value))}
          placeholder="Withdraw Amount"
        />
        <button onClick={withdraw} disabled={pendingTransaction}>Pay</button>
        {pendingTransaction && <p>Transaction is pending... Please confirm in MetaMask.</p>}
      </div>
    );
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000); // Update current time every second
    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Downtown Q'</h1>
      </header>
      <p>Current Date and Time: {currentTime.toString()}</p>
      <input
        type="text"
        value={nickname}
        onChange={handleNicknameChange}
        placeholder="Enter your nickname"
      />
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
