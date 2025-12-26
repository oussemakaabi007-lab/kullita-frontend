"use client";
import styles from './forgot.module.css';
import { useState } from "react";
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setMessage("If an account exists with this email, a reset link has been sent.");
            } else {
                setError("Something went wrong. Please try again later.");
            }
        } catch (err) {
            setError("Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <form className={styles.container} onSubmit={handleSubmit}>
                <div className={styles.header}>
                    <Link href="/login" className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className={styles.title}>Reset Password</h1>
                </div>

                <p className={styles.subtitle}>
                    Enter your email address and we'll send you a link to get back into your account.
                </p>

                {message && <div className={styles.successMessage}>{message}</div>}
                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <div className={styles.inputWrapper}>
                        <Mail className={styles.innerIcon} size={18} />
                        <input 
                            type="email" 
                            className={styles.inputField} 
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                </div>

                <button type='submit' className={styles.submitBtn} disabled={loading}>
                    <Send size={18} style={{ marginRight: '8px' }} />
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
        </div>
    );
}

export default ForgotPassword;