import React from 'react'
import { useNavigate } from 'react-router-dom';
import './Components.css';

export default function LoginButton() {
  const navigate = useNavigate();
  const handleClick = () => navigate('/pages/Login');

  return (
    <div>
        <button className='login' onClick={handleClick}>Login</button>  
    </div>
  )
}
