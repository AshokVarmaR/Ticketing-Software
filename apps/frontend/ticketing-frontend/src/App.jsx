import { useState, useEffect } from 'react'
import './App.css'
import GeneralRoutes from './Routes/GeneralRoutes'
import AdminRoutes from './Routes/AdminRoutes'
import SoftwareEngineerRoutes from './Routes/SoftwareEngineerRoutes'
import HRRoutes from './Routes/HRRoutes'
import ITRoutes from './Routes/ITRoutes'
import NetworkRoutes from './Routes/NetworkRoutes'

function App() {


  return (
    <>
      {GeneralRoutes()}
      {AdminRoutes()}
      {SoftwareEngineerRoutes()}
      {HRRoutes()}
      {ITRoutes()}
      {NetworkRoutes()}
    </>
  )
}

export default App
