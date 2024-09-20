import React, { useState } from 'react';
import Modal from './Model'; // Import your custom modal component
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../Firebase'; // Import Firebase auth

const PasswordModel = ({ isOpen, onClose, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // User authenticated
        setEmail(''); // Clear email field
        setPassword(''); // Clear password field
        setError('');
        onAuthSuccess(); // Trigger success action
        onClose(); // Close the modal
      })
      .catch((error) => {
        setError('Invalid email or password');
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Enter Credentials</h2>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleLogin}>Login</button>
      <button onClick={onClose}>Cancel</button>
    </Modal>
  );
};

export default PasswordModel;
