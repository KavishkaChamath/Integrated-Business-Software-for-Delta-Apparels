import React from 'react'
import Titlepic from '../components/Titlepic'

import LoginButton from '../components/LoginButton';
import './pages.css'





export default function Home() {
    
  return (
    <div className='wrapper3'>
    <div className='all'>
    <div className='back'>

        {/* <Titlepic/> */}
        <LoginButton/>
        {/* <img src={img} alt="Description of the image" className='homepic'/> */}
    </div>
    </div>
    <div className='logo-box'></div>
    
    <div className="footer">
    <p>&copy; 2024 Delta Apparels</p>
  </div>
  
    </div>

  )
}

