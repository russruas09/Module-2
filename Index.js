import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showAccount, setShowAccount] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showAccountInfo, setShowAccountInfo] = useState(false);

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
    if (!name || !email) {
      alert("Please enter your name and email address.");
      return;
    }

    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

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
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
      addNotification("Deposit successful");
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
      addNotification("Withdrawal successful");
    }
  };

  const addNotification = (message) => {
    setNotifications([...notifications, message]);
  };

  const toggleAccountVisibility = () => {
    setShowAccount(!showAccount);
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const toggleNotificationVisibility = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleAccountInfoVisibility = () => {
    setShowAccountInfo(!showAccountInfo);
  };

  const renderNotifications = () => {
    return (
      <div className="notifications">
        {notifications.map((notification, index) => (
          <div key={index} className="notification">
            {notification}
          </div>
        ))}
      </div>
    );
  };

  const renderAccountInfo = () => {
    return (
      <div>
        <p>Name: {name}</p>
        <p>Email: {email}</p>
      </div>
    );
  };

  const initUser = () => {
    if (!ethWallet) {
      return (
        <div>
          <p>Please install Metamask in order to use this ATM.</p>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={connectAccount}>Click here to open MetaBank</button>
        </div>
      );
    }

    if (!account) {
      return (
        <div>
          <p>Please connect your MetaBank.</p>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={connectAccount}>Click here to open MetaBank</button>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <div>
          {showAccount && <p>Your Account: {account}</p>}
          {showBalance && <p>Your Balance: {balance}</p>}
          {showAccountInfo && renderAccountInfo()}
          <button onClick={deposit}>Deposit 1 ETH</button>
          <button onClick={withdraw}>Withdraw 1 ETH</button>
          <button onClick={toggleAccountVisibility}>{showAccount ? "Hide Account Address" : "Show Account Address"}</button>
          <button onClick={toggleBalanceVisibility}>{showBalance ? "Hide Balance" : "Show Balance"}</button>
          <button onClick={toggleAccountInfoVisibility}>{showAccountInfo ? "Hide Account Info" : "Show Account Info"}</button>
          <button onClick={() => setNotifications([])}>Clear Notifications</button>
          <div>
            <button onClick={toggleNotificationVisibility}>
              {showNotifications ? "Hide Notifications" : "Show Notifications"}
            </button>
            {showNotifications && renderNotifications()}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to MetaBank</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
        .notifications {
          margin-top: 20px;
        }
        .notification {
          margin-bottom: 5px;
        }
      `}</style>
    </main>
  );
}
