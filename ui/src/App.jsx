import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useContext, useState } from "react";
import { AccountContext } from "./context/AccountProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const { account } = useContext(AccountContext);
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={ account ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={ !account ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={ !account ? <Register /> : <Navigate to="/" /> } />
      </Routes>
    </>
  );
}
