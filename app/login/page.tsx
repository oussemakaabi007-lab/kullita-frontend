// page.tsx (Login Page Component) - IMPROVED
"use client";
import styles from './login.module.css';
import { useState } from "react";
import Link from 'next/link'; // Use Next.js Link for navigation

function Login(){ // Renamed function to PascalCase
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div style={{
        height: "100vh", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
      }}>
        <form className={styles.loginContainer} action="/"> {/* Updated class name */}
            <h1 className={styles.formTitle}>Login</h1> {/* Updated class name */}
            <label> Username:
                <input type="text" name="username" className={styles.inputField}/>
            </label>
            <br style={{marginBottom: "5px"}}/>
            <label> Password:
        <div style={{ position: "relative", width: "100%" }}>
        <input
          type={showPassword ? "text" : "password"}
          className={styles.inputField}
          name='password'
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: "10px", // Improved positioning: Use 'right' for better alignment
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            userSelect: "none",
            color: "#000000" // Ensure icon is visible on the white input field
          }}
        >
          {showPassword ? "✖️" : "👁️"}
        </span>
      </div>
            </label>
            <br />
            <button type="submit" className={styles.submitBtn}>Login</button> {/* Updated class name */}
            <br />
            {/* Using Next.js Link component */}
            <Link href="/signup" className={styles.formLink}> {/* Updated class name */}
                Don't have an account? Create one
            </Link> 
           
        </form></div>
    );
}
export default Login;