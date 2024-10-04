import React from "react";
import { useNavigate } from 'react-router-dom';
import ShowOrder from "../components/ShowOder";
import Titlepic from "../components/Titlepic";
import SignOut from "../components/SignOut";
import { Helmet } from "react-helmet";

export default function EmployeeHome(){

    const navigate = useNavigate();
    const handleClick = () => navigate('/components/Orderdetails');

    return(
        <div className="holder">
            <Helmet>
                <title>Order Home</title>
            </Helmet>
            <Titlepic />
            <SignOut />
            <center><h2> Order List</h2></center>
            <div className="addButton">
            <button className="AddOrder" onClick={handleClick}>Add Order</button>
            </div>
            <ShowOrder/>
           
        </div>
    )
}