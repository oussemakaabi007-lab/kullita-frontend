import { cookies } from 'next/headers'; 
import { redirect } from 'next/navigation';
import ProfileClientContent from './ProfileClientContent';
import Menu from '@/app/components/Menu';
import Header from '@/app/components/header';
import styles from './page.module.css';
import { NextRequest } from 'next/server';
import MenuArtist from '@/app/components/MenuArtist';
export interface User {
    id: string;
    email:string;
    password: string;
    name: string; 
    role: string;
    
}

async function fetchCurrentUser(): Promise<User> {
    const cookiesStore = cookies(); 
    const token = (await cookiesStore).get('token')?.value;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${baseUrl}/users/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        }
    });
    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            redirect('/login');
        }
        throw new Error("Failed to fetch profile data from API.");
    }
    const dataa = await res.json();
    const data=dataa[0];
    return {
        id: String(data.id),
        name: data.name || data.username,
        email: data.email, 
        password: data.password,
        role: data.role,
    } as User;
}
export default async function ProfilePage() {
    
    let userInfo: User;
    userInfo = await fetchCurrentUser();
    return (
        <div className={styles.appContainer}>

            {userInfo.role==="artist" ? <MenuArtist /> : <Menu /> }
            <main className={styles.mainContent}>
              
                <div className={styles.holder}></div>
                <ProfileClientContent userInfo={userInfo} />
            </main>
        </div>
    );
}