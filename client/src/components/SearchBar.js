import React, { useState } from 'react';
import '../styles/SearchBar.css';

function SearchBar({ onSearch, onSort }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search emails..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <select onChange={(e) => onSort(e.target.value)}>
        <option value="receivedDate:desc">Newest First</option>
        <option value="receivedDate:asc">Oldest First</option>
        <option value="subject:asc">Subject A-Z</option>
        <option value="subject:desc">Subject Z-A</option>
        <option value="sender:asc">Sender A-Z</option>
        <option value="sender:desc">Sender Z-A</option>
      </select>
    </div>
  );
}

export default SearchBar; 