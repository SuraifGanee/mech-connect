/*import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Component Imports
import Technician_Register from './Components/Technician_Register';
import LoginPage from './Components/Loginpage';
import TechService from './Components/TechService';
import TechMangeService from './Components/TechMangeService';
import TechDashboard from './Components/TechDashboard';
import Customer_Reg from './Components/Customer_Register';
import Cus_Dashboard from './Components/Customer_Dashboard';
import Select_Services from './Components/Select_Services';
import Cus_Service_Req from './Components/Cus_ServiceReq';
import Request from './Components/Request';
import TechServiceReq from './Components/TechServiceReq';
import AdminDashboard from './Components/AdminDashboard';
import AddUser from './Components/Adduser';
import Tech_MangeProfile from './Components/Tech_MangeProfile';

function App() {
  return (
    <div className="App">
      < LoginPage/>
    </div>
  );
}


export default App;*/
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import LoginPage from './Components/Loginpage';
import TechDashboard from './Components/TechDashboard';
import AddService from './Components/TechService';
import ManageService from './Components/TechMangeService';
import Customer_Reg from './Components/Customer_Register';
import Cus_Dashboard from './Components/Customer_Dashboard';
import Select_Services from './Components/Select_Services';
import Request from './Components/Request';
import TechServiceReq from './Components/TechServiceReq';
import AdminDashboard from './Components/AdminDashboard';
import AddUser from './Components/Adduser';
import Tech_MangeProfile from './Components/Tech_MangeProfile';
import ForgotPassword from './Components/ForgotPassword';
import Customer_MangeProfile from './Components/Cus_ManageProfile';
import Technician_Register from './Components/Technician_Register';
import HomePage from './Components/Home';
import AboutPage from './Components/About';
import History from './Components/History';
import ManagePayments from './Components/cus_ManagePayments';

function App() {
  return (
    <Router>
     <Routes>
  {/* Common Pages */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/register-customer" element={<Customer_Reg />} />
  <Route path="/register-technician" element={<Technician_Register />} />
  <Route path="/Home" element={<HomePage />} />
  <Route path="/About" element={<AboutPage />} />
  <Route path="/History" element={<History />} />
  <Route path="/cus_ManagePayments" element={<ManagePayments />} />


  
  {/* Admin */}
  <Route path="/admin-dashboard" element={<AdminDashboard />} />
  <Route path="/add-user" element={<AddUser />} />

  {/* Technician */}
  <Route path="/technician-dashboard" element={<TechDashboard />} />
  <Route path="/add-service" element={<AddService />} />
  <Route path="/manage-service" element={<ManageService />} />
  <Route path="/manage-profile" element={<Tech_MangeProfile />} />
  <Route path="/requested-service" element={<TechServiceReq />} />

  {/* Customer */}
  <Route path="/customer-dashboard" element={<Cus_Dashboard />} />
  <Route path="/select-services" element={<Select_Services />} />
  <Route path="/customer-service-request" element={<Request />} />
  <Route path="/request" element={<Request />} />
  <Route path="/customer-manage-profile" element={<Customer_MangeProfile />} />
</Routes>

    </Router>
  );
}

export default App;







