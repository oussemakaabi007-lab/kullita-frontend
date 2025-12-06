"use client";
import styles from "./searchbar.module.css";
import { useState, useCallback, FormEvent } from "react";

function Searchbar() { // Renamed to SearchBar
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = useCallback((e: FormEvent) => {
        e.preventDefault();
        // search api
        console.log("Searching for:", searchTerm);
        // Reset search term if desired, or let it remain in the input
        // setSearchTerm('');
    }, [searchTerm]);

    return (
        <form className={styles.searchForm} onSubmit={handleSearch} role="search">
            <label htmlFor="search-input" className="sr-only">Search Music</label>
            <input
                id="search-input"
                type="text"
                placeholder="Search songs, artists, and albums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
                Search
            </button>
        </form>
    );
}
export default Searchbar;
/*import styles from "./searchbar.module.css";
function searchbar() {
  return (
    <div className={styles.search}>
      <input type="text" placeholder="Search..." />
      <button>Search</button>
    </div>
  );
}
export default searchbar;*/