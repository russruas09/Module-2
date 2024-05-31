import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmountInput, setDepositAmountInput] = useState("");
  const [withdrawAmountInput, setWithdrawAmountInput] = useState("");
  const [depositError, setDepositError] = useState(""); // State for deposit error message
  const [withdrawError, setWithdrawError] = useState(""); // State for withdraw error message
  const [isBalanceHidden, setIsBalanceHidden] = useState(false); // State for hiding/showing balance
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notifications, setNotifications] = useState([]); // State for notifications

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

  const handleAccount = (account) => {
    if (account && account.length > 0) {
      console.log("Account connected: ", account[0]);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      getATMContract();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const deposit = async () => {
    if (!atm || !ethers.utils.isAddress(account)) return;
    setDepositError(""); // Reset the error message

    try {
      const depositAmount = ethers.utils.parseEther(depositAmountInput);

      // Check if deposit amount is less than 3 ETH
      if (depositAmount.lt(ethers.utils.parseEther("3"))) {
        setDepositError("Deposit amount must be at least 3 ETH");
        return;
      }

      const tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
      setDepositAmountInput("");
      addNotification("Deposit successful");
    } catch (error) {
      console.error("Error depositing:", error);
      addNotification("Deposit failed");
    }
  };

  const withdraw = async () => {
    if (!atm || !ethers.utils.isAddress(account)) return;
    setWithdrawError(""); // Reset the error message

    try {
      const withdrawAmount = ethers.utils.parseEther(withdrawAmountInput);

      // Check if withdraw amount is less than 3 ETH
      if (withdrawAmount.lt(ethers.utils.parseEther("3"))) {
        setWithdrawError("Withdraw amount must be at least 3 ETH");
        return;
      }

      const tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      getBalance();
      setWithdrawAmountInput("");
      addNotification("Withdrawal successful");
    } catch (error) {
      console.error("Error withdrawing:", error);
      addNotification("Withdrawal failed");
    }
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };

  const addNotification = (message) => {
    setNotifications([...notifications, message]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Click here to open your RussBank</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {isBalanceHidden ? "******" : `${balance} ETH`}</p>
        <button onClick={toggleBalanceVisibility}>
          {isBalanceHidden ? "Show Balance" : "Hide Balance"}
        </button>
        <br />
        <input
          type="text"
          value={depositAmountInput}
          onChange={(e) => setDepositAmountInput(e.target.value)}
          placeholder="Enter deposit amount"
        />
        <button onClick={deposit}>Deposit</button>
        {depositError && <p style={{ color: 'red' }}>{
          depositError}</p>}
          <br />
          <input
            type="text"
            value={withdrawAmountInput}
            onChange={(e) => setWithdrawAmountInput(e.target.value)}
            placeholder="Enter withdraw amount"
          />
          <button onClick={withdraw}>Withdraw</button>
          {withdrawError && <p style={{ color: 'red' }}>{withdrawError}</p>}
          <br />
          <button onClick={clearNotifications}>Clear Notifications</button>
          {notifications.length > 0 && (
            <div>
              <h2>Notifications</h2>
              <ul>
                {notifications.map((notification, index) => (
                  <li key={index}>{notification}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    };
  
    useEffect(() => {
      getWallet();
    }, []);
  
    return (
      <main className="container">
        <header>
          <h1>Welcome to the RussBank!</h1>
        </header>
        <div>
          <label htmlFor="email">Enter your email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
          />
        </div>
        <div>
          <label htmlFor="phone">Enter your phone number:</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
          />
        </div>
        {initUser()}
        <style jsx>{`
          .container {
            text-align: center;
          }
        `}</style>
      </main>
    );
  }
  
