import React, { useState, useRef } from 'react';
import './EmployeeForm.css'; 
import { database } from '../Firebase';
import { ref, push } from 'firebase/database';
import SignOut from './SignOut';
import Titlepic from './Titlepic';
import './Orderdetails.css'; 
import { QRCodeCanvas } from 'qrcode.react';  // Updated import
import { useNavigate } from 'react-router-dom';

export const EmployeeForm = () => {

  const [employeeNumber, setEmployeeNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [callingName, setCallingName] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [contactNumber1, setContactNumber1] = useState('');
  const [contactNumber2, setContactNumber2] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [gender, setGender] = useState('');
  const [designation, setDesignation] = useState('');
  const [workType, setWorkType] = useState('');
  const [lineAllocation, setLineAllocation] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  const qrRef = useRef();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const employeeRef = ref(database, 'employees');
    const newEmployee = {
      employeeNumber,
      fullName,
      callingName,
      homeAddress,
      contactNumber1,
      contactNumber2,
      dateJoined,
      gender,
      designation,
      workType,
      lineAllocation
    };
    push(employeeRef, newEmployee)
    .then(() => {
      console.log('Data added successfully');
      setEmployeeNumber('');
      setFullName('');
      setCallingName('');
      setHomeAddress('');
      setContactNumber1('');
      setContactNumber2('');
      setDateJoined('');
      setGender('');
      setDesignation('');
      setWorkType('');
      setLineAllocation('');
    })
    .catch((error) => {
      console.error('Error adding data: ', error);
    });
    navigate('/pages/EmployeeHome');
  };

  const handleCheckboxChange = (type) => {
    setWorkType(type);
  };

  const handlePhoneNumberChange = (e, setContactNumber) => {
    const input = e.target.value;
    setContactNumber(input);
  };

  const handlePhoneNumberBlur = (contactNumber) => {
    const isValid = /^\d{10}$/.test(contactNumber);
    if (!isValid) {
      alert('Invalid Number');
    }
  };

  const handleGenerateQRCode = () => {
    setShowQRCode(true);
    setTimeout(handleDownloadQRCode, 100); // Delay to ensure QR code renders before download
  };

  const handleDownloadQRCode = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${employeeNumber}_${callingName}_QRCode.png`;
    a.click();
  };

  const generateQRCodeValue = () => {
    return `Employee Number: ${employeeNumber}, Calling Name: ${callingName}`;
  };

  return (
    <div>
      <Titlepic />
      <SignOut />
      <header className="header">
        <div className="header-content">
          <h1>Employee Management</h1>
        </div>
      </header>

      <div className="holder">
        <div className="transparent-box">
          <center><h2>Add Employee</h2></center>
          <form className="employee-form" onSubmit={handleSubmit}>
            <div className="form-group2">
              <label>Employee Number</label>
              <input type="text" placeholder="Employee Number" value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)} required />
            </div>
            <div className="form-group2">
              <label>Employee Full Name</label>
              <input type="text" placeholder="Employee Full Name" value={fullName}
                onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="form-group2">
              <label>Calling Name</label>
              <input type="text" placeholder="Calling Name" value={callingName}
                onChange={(e) => setCallingName(e.target.value)} required />
            </div>
            <div className="form-group2">
              <label>Home Address</label>
              <input type="text" placeholder="Home Address" value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)} required />
            </div>
            <div className="form-group2">
              <label>Contact Number 1</label>
              <input
                type="text"
                placeholder="Contact Number 1"
                value={contactNumber1}
                onChange={(e) => handlePhoneNumberChange(e, setContactNumber1)}
                onBlur={() => handlePhoneNumberBlur(contactNumber1)}
                required
              />
            </div>
            <div className="form-group2">
              <label>Contact Number 2</label>
              <input
                type="text"
                placeholder="Contact Number 2 (Optional)"
                value={contactNumber2}
                onChange={(e) => handlePhoneNumberChange(e, setContactNumber2)}
              />
            </div>
            <div className="form-group2">
              <label>Date of Joined</label>
              <input
                type="date"
                placeholder="Date of Joined"
                value={dateJoined}
                onChange={(e) => setDateJoined(e.target.value)}
                required
              />
            </div>
            <div className="form-group2">
              <label>Gender</label>
              <div className="radio-group">
                <input type="radio" id="male" name="gender" value="male" checked={gender === 'male'}
                  onChange={(e) => setGender(e.target.value)} />
                <label htmlFor="male">Male</label>
                <input type="radio" id="female" name="gender" value="female" checked={gender === 'female'}
                  onChange={(e) => setGender('female')} />
                <label htmlFor="female">Female</label>
              </div>
            </div>
            <div className="form-group2">
              <label>Designation</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              >
                <option value="">Select Designation</option>
                <option value="Manager">Manager</option>
                <option value="Machine Operator">Machine Operator</option>
                <option value="Training Machine Operator">Training Machine Operator</option>
                <option value="Quality Checker">Quality Checker</option>
                <option value="Helper">Helper</option>
              </select>
            </div>
            <div className="form-group2">
              <label>Direct/Indirect</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="direct"
                  name="direct"
                  checked={workType === 'Direct'}
                  onChange={() => handleCheckboxChange('Direct')}
                />
                <label htmlFor="direct">Direct</label>

                <input
                  type="checkbox"
                  id="indirect"
                  name="indirect"
                  checked={workType === 'Indirect'}
                  onChange={() => handleCheckboxChange('Indirect')}
                />
                <label htmlFor="indirect">Indirect</label>
              </div>
            </div>
            <div className="form-group2">
              <label>Employee Line Allocation</label>
              <select
                value={lineAllocation}
                onChange={(e) => setLineAllocation(e.target.value)}
                required
              >
                <option value="" disabled>Select a line</option>
                <option value="Line 1">Line 1</option>
                <option value="Line 2">Line 2</option>
                <option value="Line 3">Line 3</option>
                <option value="Line 4">Line 4</option>
                <option value="Line 5">Line 5</option>
                <option value="Line 6">Line 6</option>
              </select>
            </div>
            <button type="submit">Add</button>
            <button
              type="button"
              className="generate-qr-code"
              onClick={handleGenerateQRCode}
            >
              Generate & Download QR Code
            </button>
            {showQRCode && (
              <div className="qr-code" ref={qrRef} style={{ display: 'none' }}>
                <QRCodeCanvas value={generateQRCodeValue()} size={256} level="H" />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
