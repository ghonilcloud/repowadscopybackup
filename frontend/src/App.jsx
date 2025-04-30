import React from 'react'
import { Routes, Route } from 'react-router-dom'
import "./App.css";

import Home from './pages/Home/home'
import SignUp from './pages/Sign up/signup'
import Login from './pages/Log in/login'

import CustHome from './pages/Home/home-cust'
import SubmitTicket from './pages/Report issue/submitTicket'
import TicketsCust from './pages/All tickets/ticketsCustomer'
import TicketDetailCust from './pages/Specific tickets/ticketDetailCust'

import AgentHome from './pages/Home/home-agent'
import TicketsAgent from './pages/All tickets/ticketsAgent'
import TicketDetailAgent from './pages/Specific tickets/ticketDetailAgent'

import AdminHome from './pages/Home/home-admin'
import Analytics from './pages/Analytics/analytics'
import Users from './pages/Users and roles/users'
import AddAgent from './pages/Add agent/addAgent'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />

      <Route path="/cust-home" element={<CustHome />} />
      <Route path="/submit-ticket" element={<SubmitTicket />} />
      <Route path="/my-tickets" element={<TicketsCust />} />
      <Route path="/ticket/:ticketId" element={<TicketDetailCust />} />

      <Route path="/agent-home" element={<AgentHome />} />
      <Route path="/all-tickets" element={<TicketsAgent />} />
      <Route path="/ticket-agent/:ticketId" element={<TicketDetailAgent />} />
      
      <Route path="/admin-home" element={<AdminHome />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/users-roles" element={<Users />} />
      <Route path="/add-agent" element={<AddAgent />} />
    </Routes>
  )
}

export default App