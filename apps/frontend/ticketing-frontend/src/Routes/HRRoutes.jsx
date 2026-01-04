import { Route, Routes } from "react-router-dom";
import EmployeeDashboard from "../pages/General/EmployeeDashboard";
import EmployeeTickets from "../pages/General/EmployeeTickets";
import EmployeeRaiseTicket from "../pages/General/EmployeeRaiseTicket";
import ViewTicket from "../pages/General/ViewTicket";


function HRRoutes() {
    return (
        <Routes>
            <Route path="/hr/dashboard" element={< EmployeeDashboard />} />
            <Route path="/hr/tickets" element={< EmployeeTickets />} />
            <Route path="/hr/tickets/raise" element={< EmployeeRaiseTicket />} />
            <Route path="/hr/tickets/:id" element={< ViewTicket />} />
        </ Routes>
    )
}
export default HRRoutes;