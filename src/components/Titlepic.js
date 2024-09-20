import React from 'react'
import pic from './pic.png';
import './Components.css'

export default function Titlepic() {

    return (

      <div className='pic'>
        <img src={pic} alt="Description of the image" className='title'/>
      </div>
    )
  }