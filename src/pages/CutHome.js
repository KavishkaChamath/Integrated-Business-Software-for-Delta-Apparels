import React from 'react'
import Titlepic from "../components/Titlepic";
import { useNavigate } from 'react-router-dom';
import SignOut from "../components/SignOut";
import './pages.css'
import { Helmet } from 'react-helmet';


export default function CutHome() {
    const navigate = useNavigate();
    const handleClick = () => navigate('/comp/cutting');
    const handleClick1 = () => navigate('/comp/bundle');
    const handleClick2 = () => navigate('/comp/inqueue');

  return (
    <div>
      <Helmet>
        <title>Cut Home</title>
      </Helmet>
        <Titlepic/>
        <SignOut/>
        <div>
        <button onClick={handleClick}>Cut Detalis</button>
        <button onClick={handleClick1}>Bundle</button>
        <button onClick={handleClick2}>Inqueue</button>
        </div>
    </div>
  )
}
