import { useState } from 'react'
import {BrowserRouter as Router , Route , Routes} from 'react-router-dom'
import TripPage from './components/TripPage'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import './App.css'
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';
function App() {
  

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trip/:tripId" element={<TripPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
        />
      </div>
    </Router>
  );
}

export default App
