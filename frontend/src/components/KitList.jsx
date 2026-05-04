import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import '../styles/KitList.css';

const KitListPage = () => {
    const [allKits, setAllKits] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [operationTypeFilter, setOperationTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [uniqueOperationTypes, setUniqueOperationTypes] = useState([]);
    
    const itemsPerPage = 6;

    useEffect(() => {
        fetchKits();
    }, []);

    const fetchKits = async () => {
        try {
            const response = await api.get('/kits/');
            setAllKits(response.data);
            
            // Extract unique operation types
            const types = [...new Set(response.data.map(kit => kit.operation_type).filter(Boolean))];
            setUniqueOperationTypes(types);
        } catch (error) {
            console.error("Error loading kits", error);
        }
    };

    // Filter kits based on search and operation type
    const filteredKits = allKits.filter(kit => {
        const matchesSearch = kit.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = !operationTypeFilter || kit.operation_type === operationTypeFilter;
        return matchesSearch && matchesFilter;
    });

    // Paginate
    const totalPages = Math.ceil(filteredKits.length / itemsPerPage);
    const paginatedKits = filteredKits.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this kit?")) {
            try {
                await api.delete(`/kits/${id}/`);
                setAllKits(allKits.filter(kit => kit.id !== id));
                setCurrentPage(1);
            } catch (error) {
                console.error("Error deleting", error);
                alert("Error deleting kit");
            }
        }
    };

    const handleReset = () => {
        setSearchQuery('');
        setOperationTypeFilter('');
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '20px', background: '#f5f7fa' }}>
            <div className="kit-list-container">
                {/* Header */}
                <div className="kit-list-header">
                    <h2>My Surgical Kits</h2>
                    <p>Manage and edit your kit instruments</p>
                </div>

                {/* Search and Filters */}
                <div className="kit-controls">
                    <div className="search-group">
                        <label className="search-label">🔍 Search by name</label>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Enter kit name..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">📋 Operation Type</label>
                        <select
                            className="filter-select"
                            value={operationTypeFilter}
                            onChange={(e) => {
                                setOperationTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">-- All operation types --</option>
                            {uniqueOperationTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="control-buttons">
                        <button className="btn-reset" onClick={handleReset}>
                            ↻ Reset
                        </button>
                        <Link to="/kits/create" style={{ flex: 1, textDecoration: 'none' }}>
                            <button className="btn-create" style={{ width: '100%' }}>
                                + New Kit
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Results Info */}
                {filteredKits.length > 0 && (
                    <div className="results-info">
                        <div className="results-count">
                            Found: <strong>{filteredKits.length}</strong> kits
                        </div>
                    </div>
                )}

                {/* Kits Grid */}
                {filteredKits.length > 0 ? (
                    <>
                        <div className="kit-grid">
                            {paginatedKits.map(kit => (
                                <div key={kit.id} className="kit-card">
                                    <div className="kit-card-header">
                                        <div className="kit-card-title">
                                            {kit.name}
                                        </div>
                                        <span className="kit-card-badge">
                                            {kit.operation_type || 'No type'}
                                        </span>
                                    </div>

                                    <div className="kit-card-content">
                                        <div className="kit-card-info">
                                            <div className="kit-card-info-item">
                                                <span className="kit-card-info-label">Description:</span>
                                                <span className="kit-card-info-value">
                                                    {kit.description || 'No description'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="kit-card-instruments">
                                            <div className="kit-card-instruments-label">Instruments</div>
                                            <div className="kit-card-instruments-count">
                                                {kit.items?.length || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="kit-card-actions">
                                        <Link to={`/kits/${kit.id}/edit`} style={{ flex: 1, textDecoration: 'none' }}>
                                            <button className="btn-edit">
                                                ✏️ Edit
                                            </button>
                                        </Link>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(kit.id)}
                                        >
                                            ✕ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ← Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next →
                            </button>

                            <span className="pagination-info">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No kits found</h3>
                        <p>
                            {searchQuery || operationTypeFilter
                                ? 'Try changing your search parameters'
                                : 'Create your first kit of instruments'}
                        </p>
                        {!searchQuery && !operationTypeFilter && (
                            <Link to="/kits/create" style={{ textDecoration: 'none' }}>
                                <button className="empty-state-btn">
                                    + Create first kit
                                </button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitListPage;