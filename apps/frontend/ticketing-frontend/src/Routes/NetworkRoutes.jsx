import { Route, Routes } from "react-router-dom";
import EmployeeDashboard from "../pages/General/EmployeeDashboard";
import EmployeeTickets from "../pages/General/EmployeeTickets";
import EmployeeRaiseTicket from "../pages/General/EmployeeRaiseTicket";
import ViewTicket from "../pages/General/ViewTicket";


function NetworkRoutes() {
    return (
        <Routes>
            <Route path="/network/dashboard" element={< EmployeeDashboard />} />
            <Route path="/network/tickets" element={< EmployeeTickets />} />
            <Route path="/network/tickets/raise" element={< EmployeeRaiseTicket />} />
            <Route path="/network/tickets/:id" element={< ViewTicket />} />
        </ Routes>
    )
}
export default NetworkRoutes;