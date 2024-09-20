import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const SelectLine = () => {
  const [selectedLine, setSelectedLine] = useState('Line 1');
  const navigate = useNavigate();

  const handleSelectLine = () => {
    navigate(`/pages/LineHome`, { state: { selectedLine } });
  };

  return (
    <div>
      <h2>Select a Line</h2>
      <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={`Line ${i + 1}`}>
            Line {i + 1}
          </option>
        ))}
      </select>
      <button onClick={handleSelectLine}>Select Line</button>
    </div>
  );
};

export default SelectLine;
