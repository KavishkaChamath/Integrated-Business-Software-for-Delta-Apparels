import React from "react";
import ShowData from '../components/ShowData';
import { useNavigate } from 'react-router-dom';
import SignOut from "../components/SignOut";
import Titlepic from "../components/Titlepic";

export default function EmployeeHome(){

    const navigate = useNavigate();
    const handleClick = () => navigate('/pages/AddEmployee');
    

    return(
        <div className="holder">
        <div>
            <Titlepic/>
            <SignOut/>
            <center><h2>Employee List</h2></center>
            <button className="AddEmp" onClick={handleClick}>Add Employee</button>
            <ShowData/>
           
        </div>
        <div className="footer">
        <p>&copy; 2024 Delta Apparels</p>
      </div>
        </div>
        
    )
}