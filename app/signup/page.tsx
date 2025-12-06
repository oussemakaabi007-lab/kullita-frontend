// page.tsx (Sign Up Component) - IMPROVED
"use client";
import styles from './signup.module.css';
import { useState } from "react";
import Link from 'next/link'; // Use Next.js Link for navigation

function Signup(){ // Renamed function to PascalCase
    const [showPassword,setShowPassword]=useState(false);
    const [showConfirmPassword,setShowConfirmPassword]=useState(false);
    return (
        <div style={{
            height: "100vh", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
        }}>
        <form className={styles.container}>
            <h1 className={styles.title}>Sign Up</h1>
            <label style={{color: "#ffffff"}}> Username:
                <input type="text" name="username" className={styles.inputField}/>
            </label>
            <br />
            <label style={{color: "#ffffff"}}> Email:
                <input type="email" name="email" className={styles.inputField}/>
            </label>
            <br />
            <label style={{color: "#ffffff"}}> Password:
        <div style={{ position: "relative", width: "100%" }}>
        <input
          type={showPassword ? "text" : "password"}
            className={styles.inputField}
            name='password'/>
            <span
            onClick={()=>setShowPassword(!showPassword)}
            style={{
                position:"absolute",
                right:"10px", // Use right for stable positioning
                top:"50%",
                transform:"translateY(-50%)",
                cursor:"pointer",
                userSelect:"none",
                color: "#000000" // Black icon on white input field
            }
            }>
            {showPassword ? "✖️" : "👁️"}
            </span>
            </div></label>
            <br/>
            <label style={{color: "#ffffff"}}>
                Confirm Password:
                <div style={{ position: "relative", width: "100%" }}>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={styles.inputField}
                        name="confirmPassword" />
                    <span
                    onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                        position:"absolute",
                        right:"10px", // Use right for stable positioning
                        transform:"translateY(-50%)",
                        top:"50%",
                         cursor:"pointer",
                        userSelect:"none",
                        color: "#000000" // Black icon on white input field
                    }}>
                        {showConfirmPassword ? "✖️" : "👁️"}
                    </span>
                    
                </div>                
            </label><br/>
            <button type='submit' className={styles.btn}>Register</button>
            <br/>
            <Link href="/login" className={styles.link}>Already have an account? Login</Link>
            </form>
            </div>
    )
}
export default Signup;