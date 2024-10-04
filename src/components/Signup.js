import React, { useState } from 'react';
import { auth, database } from '../Firebase'; // Ensure you have configured and exported Firebase properly
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import Titlepic from './Titlepic';
import SignOut from './SignOut';
import { Helmet } from 'react-helmet';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [username, setUsername] = useState('');
  const [occupation, setOccupation] = useState('');

  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User signed up:', user);

        // Write user data to the Realtime Database
        const userRef = ref(database, `users/${user.uid}`);
        set(userRef, {
          username: email,
          password: password,
          occupation: occupation,
        })
        .then(() => {
          console.log('User data added to database');
          alert('New user added suceesfully');
          navigate('/pages/Admin');
        })
        .catch((error) => {
          console.error('Error adding user data to database:', error);
        });
      })
      .catch((error) => {
        console.error('Error signing up:', error.code, error.message);
      });
  };

  return (
    <div>
      <Helmet>
        <title>Add New User</title>
      </Helmet>
      <Titlepic/>
      <SignOut/>
    
    <center><h3>Add new user to the system </h3></center>
    
    <form onSubmit={handleSignUp}>
      <input
        type="text"
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
      {/* <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      /> */}
      
      <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
              >
                <option value=''>Select Occupation</option> 
                <option value='Admin'>Admin</option>
                <option value='IT Section'>IT Section</option>
                <option value='Line Manager'>Line Manager</option>
              {/* Add options as needed */}
      </select>
      <button type="submit">Sign Up</button>
    </form>
    </div>
  );
};

export default Signup;
