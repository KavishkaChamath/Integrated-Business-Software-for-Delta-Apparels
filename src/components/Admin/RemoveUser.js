import React, { useState } from 'react';
import { ref, get, remove, child } from 'firebase/database';
import { database } from '../../Firebase';

const RemoveUser = () => {
  const [username, setUsername] = useState('');

  const handleDeleteUser = async () => {

    if(username===""){
        alert("Enter username of the account to delete.")
        return;
    }

    const usersRef = ref(database, 'users');

    try {
      // Retrieve the list of users from the database
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        let userIdToDelete = null;
        let userOccupation = '';

        // Find the user by username
        for (let userId in usersData) {
          if (usersData[userId].username === username) {
            userIdToDelete = userId;
            userOccupation = usersData[userId].occupation;
            break;
          }
        }

        if (userIdToDelete) {
          // Delete the user from the database
          const confirmed = window.confirm(`Are you sure you want to remove this ${userOccupation} from the system`);
        if (confirmed) {
          await remove(child(usersRef, userIdToDelete));
          alert('User deleted successfully');
            setUsername("");
        }
        } else {
          alert('Username not found');
        }
      } else {
        alert('No users found in the database');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <center><div className='remUser' >
        <h3>Remove User from the System </h3>
        <p><b>Enter user name to remove from the system.</b></p>
      <input
        
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type='submit' onClick={handleDeleteUser}>Remove User</button>
      <br></br><br></br><br></br>
    </div></center>
  );
};

export default RemoveUser;
