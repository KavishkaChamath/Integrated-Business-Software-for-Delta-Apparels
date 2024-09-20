// src/components/SignOut.js
import React from 'react';
import { auth } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import './Components.css';

const SignOut = () => {

 const navigate = useNavigate();

  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        console.log('User signed out');
        navigate('/pages/Home', { replace: true }); // navigate to sign-in page and replace history
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  return (
    <button className='b1' onClick={handleSignOut}>Sign Out</button>
  );
};

export default SignOut;
