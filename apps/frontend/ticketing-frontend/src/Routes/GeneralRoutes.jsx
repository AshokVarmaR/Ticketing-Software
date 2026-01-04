import { Route, Routes } from "react-router-dom";
import Home from "../pages/General/Home";
import EmployeeLogin from "../pages/General/EmployeeLogin";
import ForgotPassword from "../pages/General/ForgotPassword";


function GeneralRoutes() {
    return (
        <Routes>
            <Route path="/" element={< Home />} />
            <Route path="/employees/login" element={< EmployeeLogin />} />
            <Route path="/employees/forgot-password" element={<ForgotPassword />} />
        </ Routes>
    )
}
export default GeneralRoutes;