import FavoriteSongsClientContent from "./FavoriteSongsClientContent";
import { cookies } from "next/headers";
import { Home, Search, Library, Plus, Heart, ChevronLeft, ChevronRight} from 'lucide-react';
import Link from 'next/link';
import Menu from "@/app/components/Menu";
import Header from "@/app/components/header";
import styles from './favorites.module.css';
export interface Song {
  id: number;
  title: string;
  audioUrl: string; 
  coverUrl: string;
  duration: number;
  genre: string;
  artist: string; 
  albumId: number; 
  createdAt: Date; 
  updatedAt: Date;
  isFavorite: boolean;
}
interface result{
  username:string;
  songs:Song[];
}
async function fetchFavoriteSongs() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;  
  try {
    const response = await fetch(`${baseUrl}/favorite/fav`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load favorite: HTTP ${response.status} - ${response.statusText}`);
    }
    const data: result = await response.json();
    return data;
  } catch (err: any) {
    console.log(err.message || "An unknown error occurred while getting the favorite.");
    return {username:"", songs:[]} ;
  }
}

export default async function FavoriteSongsPage() {
  const finalResult = await fetchFavoriteSongs();
  const favoriteSongs = finalResult.songs;
  const username = finalResult.username;
  return (
   <div className={styles.appContainer}>
    <div className={styles.menucontainer}>
    <Menu /></div>
     <main className={styles.mainContent}>
    <Header />
    <div className={styles.contentPadding}>
        <FavoriteSongsClientContent songs={favoriteSongs} username={username} />
    </div>
    <div className={styles.playerSafeSpace} />
     </main>
  </div>
  );
}