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
        <Link to="/route1">Route 1</Link>
        <Link to="/route2">Route 2</Link>

        {/* Route configuration */}
        <Routes>
          <Route path="/route1" element={<AddressDetails />} />
          <Route path="/route2" element={<TransactionDetails />} />
        </Routes>
      </div>
    </Router>
  );
}



export default App;
