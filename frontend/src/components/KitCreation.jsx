// src/pages/KitCreationPage.jsx
import React, { useState, useEffect } from 'react';
import '../styles/KitCreation.css';

// Fetch with authentication cookies (HTTPOnly)
const fetchWithAuth = async (url, options = {}) => {
    // Note: access_token is HTTPOnly, so we can't extract it from javascript
    // Instead, rely on credentials: 'include' to automatically send cookies
    return fetch(url, {
        ...options,
        credentials: 'include',  // Browser will automatically send HTTPOnly cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
};

const KitCreationPage = () => {
    // State for the kit itself
    const [kitData, setKitData] = useState({
        name: '',
        operation_type: '',
        description: '',
    });

    // State for instruments list in kit (same 'excel')
    const [kitItems, setKitItems] = useState([]);
    
    // State for all instruments database (for dropdown list)
    const [dbInstruments, setDbInstruments] = useState([]);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState('');

    // State for modal window to create NEW instrument
    const [showNewInstrumentForm, setShowNewInstrumentForm] = useState(false);
    const [newInstrument, setNewInstrument] = useState({ name: '', image: null });

    // Завантажуємо існуючі інструменти при відкритті сторінки
    useEffect(() => {
        fetchInstruments();
    }, []);

    const fetchInstruments = async () => {
        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/instruments/`);
            const data = await response.json();
            setDbInstruments(data);
        } catch (error) {
            console.error("Error loading instruments", error);
        }
    };

    // --- ЛОГІКА ДОДАВАННЯ ІСНУЮЧОГО ІНСТРУМЕНТУ В РЯДОК ---
    const handleAddExistingToKit = () => {
        if (!selectedInstrumentId) return;
        
        const instrumentDetails = dbInstruments.find(i => i.id === parseInt(selectedInstrumentId));
        
        // Check if already in list
        if (kitItems.some(item => item.instrument_id === instrumentDetails.id)) {
            alert("This instrument is already in the kit!");
            return;
        }

        setKitItems([
            ...kitItems, 
            { 
                instrument_id: instrumentDetails.id, 
                name: instrumentDetails.name, // For display only
                image: instrumentDetails.image, // For display only
                quantity: 1, 
                status: 'Active' 
            }
        ]);
        setSelectedInstrumentId(''); // Clear select
    };

    // --- ЛОГІКА СТВОРЕННЯ НОВОГО ІНСТРУМЕНТУ В БД ---
    const handleCreateNewInstrument = async (e) => {
        e.preventDefault();
        
        // Оскільки є файл, використовуємо FormData!
        const formData = new FormData();
        formData.append('name', newInstrument.name);
        if (newInstrument.image) {
            formData.append('image', newInstrument.image);
        }

        try {
            // Note: access_token is HTTPOnly, so we can't extract it
            // Use credentials: 'include' for the browser to send it automatically
            const response = await fetch(`${import.meta.env.VITE_API_URL}/instruments/`, {
                method: 'POST',
                headers: {
                    // Don't set Content-Type for FormData - browser will set it with boundary
                },
                credentials: 'include',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to create instrument');
            }
            
            const data = await response.json();
            
            // Instrument created in DB! Add to list
            setDbInstruments([...dbInstruments, data]);
            
            // And add immediately to current kit
            setKitItems([
                ...kitItems, 
                { 
                    instrument_id: data.id, 
                    name: data.name, 
                    image: data.image,
                    quantity: 1, 
                    status: 'Active' 
                }
            ]);
            
            // Ховаємо форму
            setShowNewInstrumentForm(false);
            setNewInstrument({ name: '', image: null });
            
        } catch (error) {
            console.error("Error creating instrument", error);
            alert("Failed to create instrument.");
        }
    };

    // --- SAVE ENTIRE KIT ---
    const handleSaveKit = async () => {
        if (!kitData.name || kitItems.length === 0) {
            alert("Enter kit name and add at least one instrument!");
            return;
        }

        // Form payload according to DRF Serializer
        const payload = {
            name: kitData.name,
            operation_type: kitData.operation_type,
            description: kitData.description,
            items: kitItems.map(item => ({
                instrument_id: item.instrument_id,
                quantity: item.quantity,
                status: item.status
            }))
        };

        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/kits/`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save kit');
            }
            
            alert("Kit saved successfully!");
            // Can redirect to kits list here
        } catch (error) {
            console.error("Error saving kit", error);
            alert("Error. Check your data.");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: '#f5f7fa' }}>
            <div className="kit-creation-container">
                {/* Left: Form Side */}
                <div className="kit-form-side">
                    {/* Kit Header */}
                    <div className="kit-header">
                        <h2>Create Kit</h2>
                        <p>Create a new surgical kit of instruments</p>
                    </div>

                    {/* Basic Kit Information */}
                    <div className="kit-section">
                        <div className="kit-section-title">
                            <span className="kit-section-icon">📋</span>
                            Basic Information
                        </div>
                        <div className="kit-form">
                            <div className="form-group">
                                <label className="form-label">Kit Name</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    placeholder="E.g. Basic Surgical"
                                    value={kitData.name}
                                    onChange={e => setKitData({...kitData, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Operation Type</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    placeholder="E.g. Appendectomy"
                                    value={kitData.operation_type}
                                    onChange={e => setKitData({...kitData, operation_type: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Kit Description</label>
                                <textarea 
                                    className="form-textarea"
                                    placeholder="Enter detailed description of the kit and its purpose..."
                                    value={kitData.description}
                                    onChange={e => setKitData({...kitData, description: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Instruments Section */}
                    <div className="kit-section">
                        <div className="kit-section-title">
                            <span className="kit-section-icon">🔧</span>
                            Add Instruments
                        </div>

                        {!showNewInstrumentForm ? (
                            <div className="instruments-add-section">
                                <div className="instruments-buttons">
                                    <select 
                                        className="form-select form-select-inline"
                                        value={selectedInstrumentId}
                                        onChange={(e) => setSelectedInstrumentId(e.target.value)}
                                    >
                                        <option value="">-- Select instrument from database --</option>
                                        {dbInstruments.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={handleAddExistingToKit}
                                        className="btn btn-primary"
                                    >
                                        ✓ Add to Kit
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setShowNewInstrumentForm(true)}
                                    className="btn btn-success"
                                    style={{ width: '100%' }}
                                >
                                    + Create NEW Instrument
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateNewInstrument} className="new-instrument-form">
                                <div className="form-group-inline">
                                    <label className="form-label">Instrument Name</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        placeholder="Name of new instrument"
                                        required
                                        value={newInstrument.name}
                                        onChange={e => setNewInstrument({...newInstrument, name: e.target.value})}
                                    />
                                </div>
                                <div className="file-input-wrapper">
                                    <label className="file-input-label">Photo</label>
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setNewInstrument({...newInstrument, image: e.target.files[0]})}
                                    />
                                </div>
                                <button type="submit" className="btn btn-success">
                                    ✓ Save
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowNewInstrumentForm(false)}
                                    className="btn btn-secondary"
                                >
                                    ✕ Cancel
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Selected Instruments Table */}
                    <div className="kit-section">
                        <div className="kit-section-title">
                            <span className="kit-section-icon">📦</span>
                            Added Instruments ({kitItems.length})
                        </div>
                        
                        {kitItems.length > 0 ? (
                            <div className="instruments-table-wrapper">
                                <table className="instruments-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%' }}>Photo</th>
                                            <th style={{ width: '30%' }}>Name</th>
                                            <th style={{ width: '15%' }}>Quantity</th>
                                            <th style={{ width: '25%' }}>Status</th>
                                            <th style={{ width: '10%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kitItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="instrument-image" />
                                                    ) : (
                                                        <div className="instrument-image-placeholder">No Image</div>
                                                    )}
                                                </td>
                                                <td className="font-weight-500">{item.name}</td>
                                                <td>
                                                    <input 
                                                        type="number"
                                                        min="1"
                                                        className="quantity-input"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const newItems = [...kitItems];
                                                            newItems[index].quantity = parseInt(e.target.value);
                                                            setKitItems(newItems);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <select 
                                                        className="status-select"
                                                        value={item.status}
                                                        onChange={(e) => {
                                                            const newItems = [...kitItems];
                                                            newItems[index].status = e.target.value;
                                                            setKitItems(newItems);
                                                        }}
                                                    >
                                                        <option value="Active">Required</option>
                                                        <option value="Optional">Optional</option>
                                                        <option value="Substitute">Substitute</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => setKitItems(kitItems.filter((_, i) => i !== index))}
                                                        className="btn btn-danger"
                                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📭</div>
                                <p>No instruments added yet. Add instruments to your kit.</p>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="kit-actions">
                        <button 
                            onClick={handleSaveKit}
                            className="btn-save"
                        >
                            ✓ Save Kit
                        </button>
                    </div>
                </div>

                {/* Right: Info Side */}
                <div className="kit-info-side">
                    <div className="info-section">
                        <h3>🏥 Kit Management</h3>
                        <p>Create and organize surgical kits for different types of operations. Each kit contains detailed information about the required instruments.</p>
                    </div>

                    <div className="info-section">
                        <h3>✨ Features</h3>
                        <div className="features-list">
                            <div className="feature-item">
                                <div className="feature-icon">📋</div>
                                <span>Organize instruments by operation types</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🏷️</div>
                                <span>Define instrument status (required, optional)</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">📸</div>
                                <span>Add photos to each instrument</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🔄</div>
                                <span>Manage quantity and substitutes</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h3>💡 Tips</h3>
                        <p>Make sure each kit has a clear name and describes its purpose. Add real photos of instruments for better identification.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitCreationPage;