import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar() {
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        navigate(`/tx/${inputValue}`);
    };

    return (
        <div className={'searchBar'}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter Tx Hash"
                className={'searchInput'}
            />
            <button onClick={handleSearch} className={'searchButton'}>
                Search
            </button>
        </div>
    );
}
