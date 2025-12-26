"use client";

import styles from './profile.module.css';
import { useState } from 'react'; 
import { Trash, Lock, Save, X, AlertTriangle, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react'; 
import { Update } from './update';
import { Delete } from './delete';
import Header from '@/app/components/header';
import Menu from '@/app/components/Menu';
import { useRouter } from 'next/navigation';
interface User {
  id: string;
  email: string;
  name: string; 
  role: string;
}
export default function ProfileClientContent({ userInfo }: { userInfo: User }) {
  const [currentUserInfo, setCurrentUserInfo] = useState({ ...userInfo });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null, msg: string }>({ type: null, msg: '' });
  const router = useRouter(); 
    const handleLogout = async () => {
     await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', });
      localStorage.clear();
      localStorage.setItem("logout_event", Date.now().toString());
      router.push('/login');
    };

  const handleUsernameSave = async (newUsername: string) => {
    
    try {
      if(!newUsername.trim()){
        setStatus({ type: 'error', msg: 'username cannot be empty' });
      return false;
    }
    if (/^\s/.test(newUsername)) {
    setStatus({ type: 'error', msg: 'Username cannot start with a space' });
    return false;
}   if (newUsername.includes("@")) {
    setStatus({ type: 'error', msg: 'Username cannot contain @' });
    return false;
}   setLoading(true);
      await Update(newUsername);
     setCurrentUserInfo(prev => ({ ...prev, name: newUsername }));
     setStatus({ type: 'success', msg: 'Username updated successfully!' });
     setLoading(false);
     return true;
    } catch (err) {
      setStatus({ type: 'error', msg: 'username is taken' });
      return false;
    }
    
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });

    if (!passwords.current.trim() || !passwords.new.trim() || !passwords.confirm.trim()) {
      setStatus({ type: 'error', msg: 'Password cannot be empty' });
      return;
    }
    if(passwords.current.trim()===passwords.new.trim()){
      setStatus({ type: 'error', msg: 'new password cannot be the same as the current ' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    try {
      setLoading(true);
      const response = await fetch('/api/users/updatePassword', {
        method: "PATCH",
         headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new})
      });
      if (!response.ok) throw new Error('Password update failed');
      setStatus({ type: 'success', msg: 'Password updated successfully!' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: 'Failed to update password. Please check your current password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    await Delete();
    handleLogout();
    setIsDeleteModalOpen(false);
  };

  return (
    <div className={styles.pageWrapper}>
        <div className={styles.scrollContainer}>
          <header className={styles.profileHeader}>
            <h1>Account Settings</h1>
          </header>

          <div className={styles.contentPadding}>
            <section className={styles.settingsSection}>
              <div className={styles.sectionHeader}>
                <ShieldCheck size={20} color="#be00b8" />
                <h2>Basic Information</h2>
              </div>
              
              <div className={styles.infoGrid}>
                <EditableField
                  initialValue={currentUserInfo.name}
                  label={currentUserInfo.role+" name"}
                  onSave={handleUsernameSave}
                />
                <div className={styles.readOnlyField}>
                  <p className={styles.fieldLabel}>Email Address</p>
                  <p className={styles.fieldDisplayText}>{currentUserInfo.email}</p>
                </div>
              </div>
            </section>
            {status.msg && (
                <div className={`${styles.statusMessage} ${status.type === 'error' ? styles.errorMsg : styles.successMsg}`}>
                  {status.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  {status.msg}
                </div>
              )}
            <section className={styles.settingsSection}>
              <div className={styles.sectionHeader}>
                <Lock size={20} color="#be00b8" />
                <h2>Security</h2>
              </div>

              

              <form className={styles.passwordForm} onSubmit={handlePasswordUpdate}>
                <div className={styles.formGroup}>
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter current password" 
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>New Password</label>
                    <input 
                      type="password" 
                      placeholder="New password" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="Confirm new password" 
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className={styles.savePasswordBtn}
                  disabled={loading}
                >
                 Update Password
                </button>
              </form>
               { loading && (
        <div className={styles.miniLoader}>
          <Loader2 className="animate-spin" size={24} />
          <span>updating profile...</span>
        </div>
      )}
            </section>
            <section className={styles.dangerZone}>
              <div className={styles.dangerText}>
                <h3>Delete Account</h3>
                <p>Deleting your account is permanent. All playlists and data will be removed forever.</p>
              </div>
              <button onClick={() => setIsDeleteModalOpen(true)} className={styles.deleteButton}>
                <Trash size={18} /> Delete Account
              </button>
            </section>
          </div>
        </div>
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDeleteModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <AlertTriangle size={48} color="#ff4d4d" className={styles.modalIcon} />
            <h2>Permanently Delete?</h2>
            <p>This action cannot be undone. You will lose access to all your music and settings.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={handleDeleteAccount}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditableField({ initialValue, label, onSave }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  return (
    <div className={styles.editableField}>
      <p className={styles.fieldLabel}>{label}</p>
      <div className={styles.fieldActionRow}>
        {isEditing ? (
          <>
            <input 
              className={styles.fieldInput} 
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              autoFocus 
            />
            <button className={styles.iconBtnSave} onClick={async() => { await onSave(value)===false ? setIsEditing(true):setIsEditing(false); }}><Save size={18}/></button>
            <button className={styles.iconBtnCancel} onClick={() => { setValue(initialValue); setIsEditing(false); }}><X size={18}/></button>
          </>
        ) : (
          <>
            <h2 className={styles.fieldDisplay}>{value}</h2>
            <button className={styles.editLink} onClick={() => setIsEditing(true)}>Change</button>
          </>
        )}
      </div>
    </div>
  );
}