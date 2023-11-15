import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';

import AddressDetails from './AddressDetails';
import TransactionDetails from './TransactionDetails';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Ethereum & Polygon Combined Explorer</h1>
        </header>

        {/* Links to navigate */}
        <nav className="app-nav">
          <ul>
            <li>
              <Link to="/address">Address</Link>
            </li>
            <li>
              <Link to="/tx">Transaction</Link>
            </li>
          </ul>
        </nav>

        {/* Route configuration */}
        <main className="app-main">
          <Routes>
            <Route path="/address/:address_input" element={<AddressDetails />} />
            <Route path="/address/" element={<Navigate to="/address/0xd90f7Fb941829CFE7Fc50eD235d1Efac05c58190" />} />

            <Route path="/tx/:tx_input" element={<TransactionDetails />} />
            <Route path="/tx/" element={<Navigate to="/tx/0x5a2e936f418affd295fcd91e8bbbbcc04ad58451bed856d4cf5b2413bd270a72" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
