import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Titlepic from '../components/Titlepic';
import './pages.css';

export default function Login() {
  const navigate = useNavigate();
  const handleClick = () => navigate('/components/AdminLog');
  const handleClick1= () => navigate('/components/ITSecLog');
  const handleClick2= () => navigate('/components/LoginForm');
  return (
    <div className='holder'>
        <Titlepic/>
           <center>
           <div className="Ithome">
            <button className="adminbutton" onClick={handleClick}>Admin</button>
            <button className="itsecbutton" onClick={handleClick1}>IT Section</button>
            <button className="linebutton" onClick={handleClick2}>Line Manager</button>
            </div>
      </center>
      <div className="footer">
        <p>&copy; 2024 Delta Apparels</p>
      </div>
    </div>
  )
}
