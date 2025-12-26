"use client";
import styles from './login.module.css';
import { useState } from "react";
import Link from 'next/link';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

function Login() {
    const [form, setForm] = useState({ "username": "", "password": "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if(!form.username.trim() || !form.password.trim()){
            setError("please type your password and username");
            return;
        }if (/^\s/.test(form.username)) {
    setError("Username cannot start with a space");
    return;
}
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) {
                setError("Login failed. Check your username or password.");
                setLoading(false);
                return;
            }
            localStorage.setItem("login_event", Date.now().toString());
            
            setTimeout(() => {
        window.location.href = data.role === 'artist' ? "/dashboard" : "/";
    }, 200);
        } catch {
            setError("Failed to connect to server");
            setLoading(false);
        }
    }

    return (
        <div className={styles.pageWrapper}>
            <form className={styles.loginContainer} onSubmit={handleSubmit}>
                <h1 className={styles.formTitle}>Login</h1>
                
                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Username/email</label>
                    <div className={styles.inputWrapper}>
                        <User className={styles.innerIcon} size={18} />
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="Username or email"
                            className={styles.inputField} 
                            onChange={handleChange} 
                            value={form.username} 
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrapper}>
                        <Lock className={styles.innerIcon} size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            className={styles.inputField}
                            name='password'
                            placeholder="Password"
                            onChange={handleChange}
                            value={form.password}
                        />
                        <button 
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className={styles.forgotWrapper}>
                    <Link href="/forgotpassword" className={styles.forgotLink}>
                        Forgot your password?
                    </Link>
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? "Connecting..." : "Log in"}
                </button>
                <div className={styles.divider}>or</div>
                <Link href="/signup" className={styles.formLink}>
                    Don't have an account? Sign up
                </Link>
            </form>
        </div>
    );
}
export default Login;