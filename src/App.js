
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import {AdminLog} from './components/AdminLog';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import {LoginForm} from './components/LoginForm';
import { ITSecLog } from './components/ITSecLog';
import LineHome from './pages/LineHome';
import Orderdetails from './components/Orderdetails';
import ItHome from './pages/ItHome';
import AddEmployee from './pages/AddEmployee';
import EmployeeHome from './pages/EmployeeHome';
import OrderHome from './pages/OderHome';
import Admin from './pages/Admin';
import EditEmployeeData from './components/EditEmployeeData';
import EditOrder from './components/EditOrder';
import EditSizeInSameOrder from './components/EditSizeInSameOrder';
import Signup from './components/Signup';
import SelectLine from './components/Line/SelectLine';
import AssignEmployee from './components/Line/AssignEmployee';
import CuttingDetailsForm from './components/Cutting';
import Bundle from './components/Bundle';
import Cutting from './components/Cutting';
import CutHome from './pages/CutHome';
import InqueueTable from './components/Inqueue';


function App() {
  return (
    <div className="App">
      <Router>
       <Routes>
       <Route path="/components/AdminLog" element={<AdminLog />} />
       <Route path="/components/ITSecLog" element={<ITSecLog />} />
       <Route path="/components/LoginForm" element={<LoginForm />} />
       <Route path="/pages/Login" element={<Login />} />
       <Route path="/pages/Home" element={<Home />} />
       <Route path="/pages/AdminHome" element={<AdminHome />} />
       <Route path="/pages/ItHome" element={<ItHome />} />
       <Route path="/pages/LineHome" element={<LineHome />} />
       <Route path="/pages/SelectLine" element={<SelectLine />} />
       <Route path="/pages/Admin" element={<Admin />} />
       <Route path="/pages/EmployeeHome" element={<EmployeeHome />} />
       <Route path="/pages/OrderHome" element={<OrderHome />} />
       <Route path="/pages/CutHome" element={<CutHome />} />
       <Route path="/components/Orderdetails" element={<Orderdetails />} />
       <Route path="/pages/AddEmployee" element={<AddEmployee />} />
       <Route path="/edit-employee" element={<EditEmployeeData />} />
       <Route path="/editOrder" element={<EditOrder />} />
       <Route path="/addSizeInSameOrder" element={<EditSizeInSameOrder />} />
       <Route path="/components/AddNewUser" element={<Signup />} />
       <Route path="/line/selectLine" element={<SelectLine />} />
       <Route path="/line/AssignEmp" element={<AssignEmployee />} />
       <Route path="/comp/cutting" element={<CuttingDetailsForm />} />
       <Route path="/comp/bundle" element={<Bundle/>} />
       <Route path="/comp/cutting" element={<Cutting/>} />
       <Route path="/comp/inqueue" element={<InqueueTable/>} />
       <Route path="/" element={<Home />} />
      </Routes>
    </Router>
    
    {/* <AdminLog/> */}
    
    </div>
  );
}

export default App;
