import React from 'react'
import Titlepic from '../components/Titlepic'

import LoginButton from '../components/LoginButton';
import './pages.css'
import logo from '../components/pic.png';





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
    <table border='0' width='35%' height='15%'>
        <tr>
          <th className='logoImg'><img src={logo} alt="Description of the image" /></th>
        </tr>
      </table>
    <div className="footer">
    <p>&copy; 2024 Delta Apparels</p>
  </div>
  
    </div>

  )
}

