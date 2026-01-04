import { Route, Routes } from "react-router-dom";
import AdminEmployees from "../pages/Admin/AdminEmployees";
import AdminAddEmployee from "../pages/Admin/AdminAddEmployee";
import AdminViewEmployee from "../pages/Admin/AdminViewEmployee";
import EmployeeTickets from "../pages/General/EmployeeTickets";
import EmployeeRaiseTicket from "../pages/General/EmployeeRaiseTicket";
import ViewTicket from "../pages/General/ViewTicket";
import EmployeeDashboard from "../pages/General/EmployeeDashboard";
import Reports from "../pages/General/Reports";


function AdminRoutes(){
    return(
        <Routes>
        <Route path="/admin/dashboard" element={< EmployeeDashboard />} />
        <Route path="/admin/employees" element={< AdminEmployees />} />
        <Route path="/admin/employees/add" element={< AdminAddEmployee />} />
        <Route path="/admin/employees/view/:id" element={< AdminViewEmployee />} />
        <Route path="/admin/tickets" element={< EmployeeTickets />} />
        <Route path="/admin/tickets/raise" element={< EmployeeRaiseTicket />} />
        <Route path="/admin/tickets/:id" element={< ViewTicket />} />
        <Route path="/admin/reports" element={< Reports />} />
        </ Routes>
    )
}
export default AdminRoutes;