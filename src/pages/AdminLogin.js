import React, { useState } from 'react'
import Titlepic from '../components/Titlepic'
import Admin from './images/Admin.jpg'
import './pages.css'
import { auth } from '../Firebase';
import { LoginForm } from '../components/LoginForm';


export default function AdminLogin() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await auth.signInWithEmailAndPassword(email, password);
      alert('Signed in successfully');
    } catch (error) {
      console.error('Error signing in', error);
      alert('Error signing in');
    }
  };

  return (
    <div>
        <Titlepic/>
    {/* <div className='wrapper'>
     <div className='Admindp'>
     <form onSubmit={handleSignIn}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Sign In</button>
    </form>
     </div>
     </div> */}
    <LoginForm/>
    </div>
  )
}
