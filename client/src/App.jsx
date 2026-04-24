import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Home from "./components/Pages/Home";
import MovieDetail from "./components/Pages/MovieDetail";
import SeatSelection from "./components/Pages/SeatSelection";
import MyBookings from "./components/Pages/MyBookings";
import Navbar from "./components/Components/Navbar";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/movie/:id" element={<PrivateRoute><MovieDetail /></PrivateRoute>} />
        <Route path="/movie/:id/seats/:showtimeIndex" element={<PrivateRoute><SeatSelection /></PrivateRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
