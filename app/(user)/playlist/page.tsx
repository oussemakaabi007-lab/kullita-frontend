import PlaylistClientContent from '@/app/(user)/playlist/PlaylistClientContent';
import Menu from '@/app/components/Menu';
import Header from '@/app/components/header';
import { cookies } from "next/headers";
import styles from './playlist.module.css';
interface PlaylistData {
  id: string;
  name: string;
}
interface result {
  username:string;
  playlists: PlaylistData[];
}
async function fetchPlaylists(): Promise<result> {
   const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${baseUrl}/playlist/showAll`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Cookie": `token=${token}` 
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to load playlists: HTTP ${response.status} - ${response.statusText}`);
      }
      const data :result = await response.json();
      return data;
    } catch (err) {
      console.error("loading failed", err);
      return {username:"", playlists: []};
    }
}

export default async function PlaylistPage() {
  const res = await fetchPlaylists();
  const playlists = res.playlists;
  const user = res.username;
  return (
    <div className={styles.appContainer}>
    <div className={styles.menucontainer}>
    <Menu /></div>
     <main className={styles.mainContent}>
    <Header />
    <div className={styles.contentPadding}>
        <PlaylistClientContent playlists={playlists} user={user} />
    </div>
     </main>
  </div>
  );
}