import React, { useState, useEffect,useContext } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../components/UserDetails';
import welcome from './Images/img101.png';


const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditButton, setShowEditButton] = useState(false); // State to show/hide the button

  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    const employeeRef = ref(database, 'employees');
    onValue(employeeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const employeeList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setEmployees(employeeList);
        setFilteredEmployees(employeeList); // Initially display all employees
      }
    });
  }, []);

  useEffect(() => {
    // Live filtering as user types
    if (searchTerm.trim() !== '') {
      const liveFiltered = employees.filter((emp) =>
        emp.employeeNumber.startsWith(searchTerm) // Match numbers starting with the search term
      );
      setFilteredEmployees(liveFiltered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  const navigateHome = ()=>{
    if (user && user.occupation) { // Check if `user` and `occupation` exist
      if (user.occupation === "IT Section") {
        navigate('/pages/ItHome');
      } else if (user.occupation === "Admin") {
        navigate('/pages/Admin');
      } else {
        console.log("User occupation not recognized!");
      }
    } else {
      alert("User data is not available. Please try again.");
    }
  }
  const handleSearch = () => {
    // Manual filtering when search button is clicked
    if (searchTerm.trim() === '') {
      alert('Please enter an Employee Number or Employee Name to search.');
      setFilteredEmployees(employees); // Show all employees if search term is empty
      setSelectedEmployee(null); // Clear the selected employee
      setShowEditButton(false); // Hide the button
    } else {
      const filtered = employees.filter(
        (emp) =>
          emp.employeeNumber.includes(searchTerm) ||
          emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);

      if (filtered.length === 1) {
        setSelectedEmployee(filtered[0]); // Select the employee if exactly one match
        setShowEditButton(true); // Show the button
      } else {
        setSelectedEmployee(null);
        setShowEditButton(false); // Hide the button
      }
    }
  };

  const handleDelete = () => {
    if (selectedEmployee) {
      const confirmed = window.confirm('Are you sure you want to remove this employee?');
      if (confirmed) {
        const employeeRef = ref(database, `employees/${selectedEmployee.id}`);
        remove(employeeRef)
          .then(() => {
            alert('Employee deleted successfully');
            const updatedEmployees = employees.filter(
              (emp) => emp.id !== selectedEmployee.id
            );
            setEmployees(updatedEmployees);
            setFilteredEmployees(updatedEmployees);
            setSelectedEmployee(null); // Clear the selected employee after deletion
            setShowEditButton(false); // Hide the button
          })
          .catch((error) => {
            console.error('Error deleting employee:', error);
          });
      }
    }
  };

  const calculateExperience = (dateJoined) => {
    const joinDate = new Date(dateJoined);
    const currentDate = new Date();

    let diffYears = currentDate.getFullYear() - joinDate.getFullYear();
    let diffMonths = currentDate.getMonth() - joinDate.getMonth();

    // Adjust the year and month difference if necessary
    if (diffMonths < 0) {
      diffYears--;
      diffMonths += 12;
    }

    if (diffYears === 0) {
      return `${diffMonths} months`;
    } else {
      return `${diffYears} years ${diffMonths} months`;
    }
  };

  const handleEdit = () => {
    if (selectedEmployee) {
      // Navigate to EditEmployee component and pass selectedEmployee data
      navigate('/edit-employee', { state: { employeeData: selectedEmployee } });
    }
  };

  return (
    
    <div className="empTable">

      <button className='homeBtn' onClick={navigateHome}>
              Home
      </button>
      <div>
        <input
          type="text"
          placeholder="Search by Employee Number or Full Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Live filtering
        />
        <button className="search" onClick={handleSearch}>
          Search
        </button>
      </div>
      {filteredEmployees.length > 0 ? (
        <table border="1" align="center">
          <thead>
            <tr>
              <th>Employee Number</th>
              <th>Full Name</th>
              <th>Calling Name</th>
              <th>Home Address</th>
              <th>Contact Number-1</th>
              <th>Contact Number-2</th>
              <th>Date Joined</th>
              <th>Experience</th>
              <th>Gender</th>
              <th>Designation</th>
              <th>Direct Or Indirect</th>
              <th>Line Allocation</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employeeNumber}</td>
                <td>{employee.fullName}</td>
                <td>{employee.callingName}</td>
                <td>{employee.homeAddress}</td>
                <td>{employee.contactNumber1}</td>
                <td>{employee.contactNumber2}</td>
                <td>{employee.dateJoined}</td>
                <td>{calculateExperience(employee.dateJoined)}</td>
                <td>{employee.gender}</td>
                <td>{employee.designation}</td>
                <td>{employee.workType}</td>
                <td>{employee.lineAllocation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No employee data available</p>
      )}

      {selectedEmployee && (
        <div>
          {showEditButton && (
            <button className="editEmp" onClick={handleEdit}>
              Edit Employee
            </button>
          )}
          <button className="deleteEmp" onClick={handleDelete}>
            Delete Selected Employee
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
