import { Link } from "react-router-dom";
import "./Navbar.css";
import { useContext, useState } from "react";
import { CityContext } from "../context/CityContext";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { city } = useContext(CityContext);
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav
      className="navbar navbar-expand-lg border-bottom sticky-top"
      style={{ backgroundColor: "white", height: "4.4rem" }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center px-5">
        
        {/* Left Side */}
        <div className="d-flex align-items-center">
          <Link className="navbar-brand me-4" to="/">
            <img src="/media/logo.svg" alt="Taskora Logo" style={{ height: "40px" }} />
          </Link>
          <ul className="navbar-nav d-flex flex-row gap-4">
            <li className="nav-item" style={{ marginRight: "2rem" }}>
              <Link className="nav-link" to={`/gigs/${city}`}>
                Gigs
              </Link>
            </li>
            <li className="nav-item" style={{ marginRight: "20rem" }}>
              <Link className="nav-link" to={`/services/${city}`}>
                Services
              </Link>
            </li>
          </ul>
        </div>

        {/* Right Side */}
        <div className="d-flex align-items-center gap-3">
          {user ? (
            <div
              className="profile-dropdown"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
              style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
            >
              <span className="fw-bold text-primary">
                Hi, {user.username} 👋
              </span>

              {/* Profile Circle */}
              <div
                className="profile-circle"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#007bff",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="dropdown-menu show"
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: "0",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    zIndex: 1000,
                    minWidth: "200px"
                  }}
                >
                  <Link className="dropdown-item" to="/applications">Task Applied History</Link>
                  <Link className="dropdown-item" to="/update-profile">Update Profile</Link>
                  <div className="dropdown-divider"></div>
                  <button
                    onClick={logout}
                    className="dropdown-item text-danger"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-primary rounded-pill px-4">
                Login
              </Link>
              <Link to="/signUp" className="btn btn-danger rounded-pill px-4">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
