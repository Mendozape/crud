import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import About from './About';

export default function BasicExample() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </ul>
        <hr />
        <Routes>
          <Route path="/about" element={About}/>
          <Route path="/dashboard" component={Dashboard}/>
        </Routes>
      </div>
    </Router>
  );
}



function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
    </div>
  );
}
