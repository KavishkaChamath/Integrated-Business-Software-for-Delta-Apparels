import React, { useState } from 'react';
import './Admin.css';
import { useNavigate } from 'react-router-dom';
import SignOut from '../components/SignOut';
import Titlepic from '../components/Titlepic';




function App() {
  const navigate = useNavigate();

  const [lines, setLines] = useState([
    { id: 1, efficiency: "58%", incentive: "67/=", quality: "1" },
    { id: 2, efficiency: "58%", incentive: "67/=", quality: "1" },
    { id: 3, efficiency: "58%", incentive: "67/=", quality: "1" },
    { id: 4, efficiency: "58%", incentive: "67/=", quality: "1" },
    { id: 5, efficiency: "58%", incentive: "67/=", quality: "1" },
    { id: 6, efficiency: "58%", incentive: "67/=", quality: "1" },
  ]);

  
  const pageChanger = (path) => navigate(path);


  const handleChange = (id, field, value) => {
    setLines(lines.map(line => line.id === id ? { ...line, [field]: value } : line));
  };

  return (
    
    <div className="App">
      <Titlepic/>
      <SignOut/>
      <header className="App-header">
        <h1>Admin Home</h1>
      </header>
      <div className="sidebar">
        <button className="sidebar-button" onClick={() => pageChanger('/pages/EmployeeHome')}>Employee Details</button>
        <button className="sidebar-button" onClick={() => pageChanger('/pages/OrderHome')}>Orderdetails</button>
        <button className="sidebar-button">Cutting</button>
        <button className="sidebar-button">Bundle</button>
        <button className="sidebar-button">Shift</button>
        <button className="sidebar-button" onClick={() => pageChanger('/components/AddNewUser')}>Add new User</button>
      </div>
      <div className="main-content">
        <div className="line-item">
          <div className="line-name1">Line</div>
          <div className="line-detail1">Efficiency</div>
          <div className="line-detail1">Incentive</div>
          <div className="line-detail1">Quality</div>
        </div>
        {lines.map(line => (
          <div className="line-item" key={line.id}>
            <div className="line-name">Line {line.id}</div>
            <div className="line-detail">
              <input
                type="text"
                value={line.efficiency}
                onChange={(e) => handleChange(line.id, 'efficiency', e.target.value)}
              />
            </div>
            <div className="line-detail">
              <input
                type="text"
                value={line.incentive}
                onChange={(e) => handleChange(line.id, 'incentive', e.target.value)}
              />
            </div>
            <div className="line-detail">
              <input
                type="text"
                value={line.quality}
                onChange={(e) => handleChange(line.id, 'quality', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

