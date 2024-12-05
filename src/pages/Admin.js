import React, { useState,useEffect,useContext } from 'react';
import './Admin.css';
import { useNavigate } from 'react-router-dom';
import SignOut from '../components/SignOut';
import Titlepic from '../components/Titlepic';
import { database } from '../Firebase'; // Adjust the import path as needed
import { ref, onValue, } from 'firebase/database';
import { Helmet } from 'react-helmet';
import { UserContext } from '../components/UserDetails';
import welcome from '../components/Images/img101.png';


function App() {
  const navigate = useNavigate();

  const { user } = useContext(UserContext);

  const currentDate = new Date().toISOString().split('T')[0]; // Format current date as YYYY-MM-DD

  const [lines, setLines] = useState([
    { id: 1, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 2, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 3, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 4, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 5, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 6, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 7, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 8, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 9, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 10, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 11, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 12, efficiency: "0%", incentive: "0/=", quality: "0" },
  ]);
  

  // Firebase reference to dailyUpdates for the current date
  const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}`);
  
  const pageChanger = (path) => navigate(path);


  useEffect(() => {
    const unsubscribe = onValue(dailyUpdatesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        const updatedLines = lines.map((line) => {
          const lineData = data[`Line ${line.id}`]; // Accessing data for each line
          
          if (lineData?.Effiency) {
            // Sum up all the Quality values inside Effiency entries
            const totalQuality = Object.values(lineData.Effiency).reduce((sum, effEntry) => {
              return sum + (effEntry.Quality || 0); // Add each Quality, defaulting to 0 if not present
            }, 0);
  
            return {
              ...line,
              efficiency: lineData?.CurrentEffiency ? `${lineData.CurrentEffiency.toFixed(2)}%` : "0%",
              quality: totalQuality+lineData?.total1stQuality || "0", // Set the total sum of Quality
              incentive: lineData?.Incentive || "0/=",
            };
          } else {
            // If no efficiency data, set default values
            return {
              ...line,
              efficiency: lineData?.CurrentEffiency ? `${lineData.CurrentEffiency.toFixed(2)}%` : "0%",
              quality: lineData?.total1stQuality || "0",
              incentive: `${lineData?.Incentive || 0}/=` || "0/=",
            };
          }
        });
        
        setLines(updatedLines);
      }
    });
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentDate]);
  

  return (
    
    <div className="holder">
      <div>
      <Helmet>
        <title>Admin Home</title>
      </Helmet>
      <Titlepic />
      <SignOut />

      
      <div className="sidebar">
      <table border={0}>
        <tr>
          <th className='welImg'><img src={welcome} alt="Description of the image"/></th>
          <th><p className='welcomeName'>{user?.username || 'User'}</p></th>
        </tr>
      </table>
        <button className="sidebar-button" onClick={() => pageChanger('/pages/EmployeeHome')}>Employee Details</button>
        <button className="sidebar-button" onClick={() => pageChanger('/pages/OrderHome')}>Order Details</button>
        <button className="sidebar-button" onClick={() => pageChanger('/pages/CutHome')}>Cutting</button>
        <button className="sidebar-button" onClick={() => pageChanger('/comp/inqueue')}>Inqueue Details</button>
        <button className="sidebar-button" onClick={() => pageChanger('/admin/ongoing')}>On going operations</button>
        <button className="sidebar-button" onClick={() => pageChanger('/comp/admin/pauseTime')}>Check Pause Time</button>
        <button className="sidebar-button" onClick={() => pageChanger('/admin/summary')}>Order Summary</button>
        <button className="sidebar-button" onClick={() => pageChanger('/components/AddNewUser')}>Manage Users</button>
      </div>
      <center><h2>Admin Home</h2></center>
      <div className="main-content">
        <div className="line-item1">
          <div className="line-name1">Line</div>
          <div className="line-detail1">Efficiency</div>
          <div className="line-detail1">Incentive</div>
          <div className="line-detail1">1st Quality</div>
        </div>
        {lines.map(line => (
          <div className="line-item" key={line.id}>
            <div className="line-name">Line {line.id}</div>
            <div className="line-detail">{line.efficiency}</div>
            <div className="line-detail">{line.incentive}</div>
            <div className="line-detail">{line.quality}</div>
          </div>
        ))}
      </div>
      <br></br><br></br><br></br><br></br>
    </div>
    </div>
  );
}

export default App;

