import React, { useState } from 'react';
import './Components.css';  // Import the CSS file

const SelectLine = () => {
  const [selectedValue, setSelectedValue] = useState('');

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleProceed = () => {
    if (selectedValue) {
      alert(`You selected: ${selectedValue}`);
      // Add more logic here if needed
    } else {
      alert('Please select a value.');
    }
  };

  return (
    <div className="select-line-container">
      <div className="select-line-frame">
        <div className="select-line-row">
          <label htmlFor="select-line" className="select-line-label">Choose a line:</label>
          <select id="select-line" className="select-line-select" value={selectedValue} onChange={handleSelectChange}>
            <option value=""></option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleProceed}>Proceed</button>
      </div>
    </div>
  );
};

export default SelectLine;


