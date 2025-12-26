"use client";
import styles from './signup.module.css';
import { useState } from "react";
import Link from 'next/link';
import { Eye, EyeOff, Lock, User, Mail, Music, Loader2 } from 'lucide-react';

function Signup() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "listener"
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if(!form.username.trim() || !form.email.trim()|| !form.password.trim()){
            setError("all fields are required");
            return;
        }
        if (/^\s/.test(form.username)) {
    setError("Username cannot start with a space");
    return;
}
        if (form.username.includes("@")) {
    setError("Username cannot contain @");
    return;
}
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    name: form.username,
                    password: form.password,
                    role: form.role,
                })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Something went wrong");
                setLoading(false);
                return;
            }
            if(data.message!=="wellcome"){
                setError(data.message);
                return;
            }
            window.location.href = "/login";
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <form className={styles.container} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Create Account</h1>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Username</label>
                    <div className={styles.inputWrapper}>
                        <User className={styles.innerIcon} size={18} />
                        <input type="text" name="username" className={styles.inputField} placeholder="Choose a username" onChange={handleChange} value={form.username} required />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <div className={styles.inputWrapper}>
                        <Mail className={styles.innerIcon} size={18} />
                        <input type="email" name="email" className={styles.inputField} placeholder="name@example.com" onChange={handleChange} value={form.email} required />
                    </div>
                </div>
                { loading && (
        <div className={styles.miniLoader}>
          <Loader2 className="animate-spin" size={24} />
          <span>creating account...</span>
        </div>
      )}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrapper}>
                        <Lock className={styles.innerIcon} size={18} />
                        <input type={showPassword ? "text" : "password"} name="password" className={styles.inputField} placeholder="••••••••" onChange={handleChange} value={form.password} required />
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Confirm Password</label>
                    <div className={styles.inputWrapper}>
                        <Lock className={styles.innerIcon} size={18} />
                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className={styles.inputField} placeholder="••••••••" onChange={handleChange} value={form.confirmPassword} required />
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className={styles.roleSelection}>
                    <span className={styles.label}>Register as:</span>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input type="radio" name="role" value="listener" defaultChecked={true} onChange={handleChange} />
                            <div className={styles.customRadio}>Listener</div>
                        </label>
                        <label className={styles.radioLabel}>
                            <input type="radio" name="role" value="artist" onChange={handleChange} />
                            <div className={styles.customRadio}>Artist</div>
                        </label>
                    </div>
                </div>

                <button type='submit' className={styles.submitBtn} disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                <div className={styles.divider}>or</div>

                <Link href="/login" className={styles.formLink}>
                    Already have an account? Login
                </Link>
            </form>
        </div>
    );
}

export default Signup;