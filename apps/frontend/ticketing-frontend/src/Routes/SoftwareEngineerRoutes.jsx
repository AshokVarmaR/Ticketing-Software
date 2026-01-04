import { Route, Routes } from "react-router-dom";
import EmployeeDashboard from "../pages/General/EmployeeDashboard";
import EmployeeTickets from "../pages/General/EmployeeTickets";
import EmployeeRaiseTicket from "../pages/General/EmployeeRaiseTicket";
import ViewTicket from "../pages/General/ViewTicket";


function SoftwareEngineerRoutes() {
    return (
        <Routes>
            <Route path="/software-engineer/dashboard" element={< EmployeeDashboard />} />
            <Route path="/software-engineer/tickets" element={< EmployeeTickets />} />
            <Route path="/software-engineer/tickets/raise" element={< EmployeeRaiseTicket />} />
            <Route path="/software-engineer/tickets/:id" element={< ViewTicket />} />
        </ Routes>
    )
}
export default SoftwareEngineerRoutes;