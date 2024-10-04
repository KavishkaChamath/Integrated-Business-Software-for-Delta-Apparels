import React, { useState } from 'react';
import { ref, push, set } from 'firebase/database';
import { database } from '../Firebase'; // Adjust the import path as necessary

const AddNewUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [occupation, setOccupation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a new user object
    const newUser = {
      username,
      password,
      occupation
    };

    // Get a reference to the 'users' node
    const userRef = ref(database, 'users');
    const newUserRef = push(userRef); // This will create a new unique key

    // Add the new user to the database
    set(newUserRef, newUser)
      .then(() => {
        console.log('New user added successfully');
        // Clear the form fields
        setUsername('');
        setPassword('');
        setOccupation('');
      })
      .catch((error) => {
        console.error('Error adding new user: ', error);
      });
  };

  return (
    <div>
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Occupation:</label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddNewUser;
