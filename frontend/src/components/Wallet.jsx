import { useEffect, useState } from "react";
import api from "../api";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  async function loadWallet() {
    try {
      const walletResponse = await api.get("/wallet");
      const transactionResponse = await api.get("/wallet/transactions");

      setWallet(walletResponse.data);
      setTransactions(transactionResponse.data);
    } catch (error) {
      setMessage("Could not load wallet");
    }
  }

  useEffect(() => {
    loadWallet();
  }, []);

  async function topUp(event) {
    event.preventDefault();
    setMessage("");

    try {
      await api.post("/wallet/topup", {
        amount: Number(amount),
      });

      setAmount("");
      setMessage("Top-up successful");
      loadWallet();
    } catch (error) {
      setMessage(error.response?.data?.message || "Top-up failed");
    }
  }

  if (!wallet) {
    return <p>Loading wallet...</p>;
  }

  return (
    <section>
      <h2>My Wallet</h2>

      <h3>Balance: Rs. {wallet.balance.toFixed(2)}</h3>

      <form onSubmit={topUp}>
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="Top-up amount"
          value={amount}
          required
          onChange={(event) => setAmount(event.target.value)}
        />

        <button type="submit">Add Money</button>
      </form>

      {message && <p>{message}</p>}

      <h3>Transaction History</h3>

      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        transactions.map((transaction) => (
          <article key={transaction._id}>
            <p>Type: {transaction.type}</p>
            <p>Amount: Rs. {transaction.amount.toFixed(2)}</p>
            <p>Status: {transaction.status}</p>
            <p>Date: {new Date(transaction.createdAt).toLocaleString()}</p>
          </article>
        ))
      )}
    </section>
  );
}
