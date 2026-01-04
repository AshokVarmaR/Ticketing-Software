import { Route, Routes } from "react-router-dom";
import EmployeeDashboard from "../pages/General/EmployeeDashboard";
import EmployeeTickets from "../pages/General/EmployeeTickets";
import EmployeeRaiseTicket from "../pages/General/EmployeeRaiseTicket";
import ViewTicket from "../pages/General/ViewTicket";


function ITRoutes() {
    return (
        <Routes>
            <Route path="/it/dashboard" element={< EmployeeDashboard />} />
            <Route path="/it/tickets" element={< EmployeeTickets />} />
            <Route path="/it/tickets/raise" element={< EmployeeRaiseTicket />} />
            <Route path="/it/tickets/:id" element={< ViewTicket />} />
        </ Routes>
    )
}
export default ITRoutes;