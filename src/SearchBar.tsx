import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';
import { ethers } from 'ethers';

export default function SearchBar() {
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        if (ethers.isAddress(inputValue))
            navigate(`/address/${inputValue}`);
        else
            navigate(`/tx/${inputValue}`);
    };

    return (
        <div className={'searchBar'}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter Address Or Tx Hash"
                className={'searchInput'}
            />
            <button onClick={handleSearch} className={'searchButton'}>
                Search
            </button>
        </div>
    );
}
