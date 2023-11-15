import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import AddressDetails from './AddressDetails';
import TransactionDetails from './TransactionDetails';

function App() {
  return (
    <Router>
      <div>
        {/* Links to navigate */}
        <Link to="/address">Address</Link>
        <Link to="/tx">Transaction</Link>

        {/* Route configuration */}
        <Routes>
          <Route path="/address/:address_input" element={<AddressDetails />} />
          <Route path="/tx/:tx_input" element={<TransactionDetails />} />
        </Routes>
      </div>
    </Router>
  );
}



export default App;
