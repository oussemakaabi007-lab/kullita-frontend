"use client";
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import styles from './reset.module.css';
import { Lock, Eye, EyeOff } from 'lucide-react';
function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus({ type: 'error', msg: 'Passwords do not match' });
            return;
        }
        if(!password.trim()|| !confirmPassword.trim()){
            setStatus({type:'error',msg:'Please write your new password and confirm it'});
            return;
        }
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password })
            });

            if (res.ok) {
                setStatus({ type: 'success', msg: 'Password reset! Redirecting to login...' });
                setTimeout(() => window.location.href = "/login", 3000);
            } else {
                setStatus({ type: 'error', msg: 'Reset failed. Link may be expired.' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Reset failed. Link may be expired.' });
        }
    };

    return (
        <form className={styles.container} onSubmit={handleReset}>
            <h1 className={styles.title}>New Password</h1>
            
            {status.msg && (
                <div className={status.type === 'error' ? styles.errorMessage : styles.successMessage}>
                    {status.msg}
                </div>
            )}

            <div className={styles.inputGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrapper}>
                    <Lock className={styles.innerIcon} size={18} />
                    <input 
                        type={showPassword ? "text" : "password"} 
                        className={styles.inputField}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrapper}>
                    <Lock className={styles.innerIcon} size={18} />
                    <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className={styles.inputField}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <button type="submit" className={styles.submitBtn}>Update Password</button>
        </form>
    );
}
export default function ResetPasswordPage() {
    return (
        <div className={styles.pageWrapper}>
            <Suspense fallback={<div className={styles.container}>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}