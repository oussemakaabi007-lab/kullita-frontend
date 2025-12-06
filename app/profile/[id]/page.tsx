import Menu from "@/app/components/Menu"; 
import ProfileClientContent from "./ProfileClientContent"; 
import styles from './profile.module.css';
interface User {
    id: string;
    username: string;
    profilePic: string;
    favoriteSongs: { id: number; title: string; artist: string }[];
}
async function fetchUserInfo(userId: string | undefined): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const CURRENT_USER_ID = 'user123';
    const safeUserId = userId || 'guest_profile'; 
    const isCurrentUser = safeUserId === CURRENT_USER_ID;
    const mockFavorites = [
        { id: 101, title: "Starlight Serenade", artist: "Luna Waves" },
        { id: 102, title: "Neon Skyline", artist: "Cyber Drifter" },
    ];

    return {
        id: safeUserId,
        username: isCurrentUser 
            ? "Current User" 
            : safeUserId.length > 5 
                ? `Guest_${safeUserId.substring(0, 5)}...` 
                : `Guest_${safeUserId}`,
        profilePic: "/login.png",
        favoriteSongs: mockFavorites,
    };
}
export default async function Profile({ params }: { params: { id: string | undefined } }) {
    
    const CURRENT_USER_ID = 'user123'; 
    const profileId = params.id;
    
    const userInfo = await fetchUserInfo(profileId);
    const isCurrentUser = userInfo.id === CURRENT_USER_ID;

  return (
    <div className={styles.layout}>
        <Menu />
        <ProfileClientContent 
            userInfo={userInfo}
            isCurrentUser={false}
        />
    </div>
  );
}