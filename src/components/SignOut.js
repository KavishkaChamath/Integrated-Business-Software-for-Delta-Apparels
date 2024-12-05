// src/components/SignOut.js
import React, {useContext} from 'react';
import { auth } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import './Components.css';
import { UserContext } from './UserDetails'; 

const SignOut = () => {

 const navigate = useNavigate();

 const { setUser } = useContext(UserContext);

  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        console.log('User signed out');
        // Clear user data from sessionStorage
        sessionStorage.removeItem('user');
        
        // Clear user data from context
        setUser(null); // This will update the context and trigger a re-render in your components

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
