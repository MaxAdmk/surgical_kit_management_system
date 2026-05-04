// src/pages/KitEditPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/KitEdit.css';

const KitEditPage = () => {
    const { id } = useParams(); // Get kit ID from URL
    const navigate = useNavigate();

    const [kitData, setKitData] = useState({ name: '', operation_type: '', description: '' });
    const [kitItems, setKitItems] = useState([]);
    
    const [dbInstruments, setDbInstruments] = useState([]);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInstruments();
        fetchKitDetails();
    }, [id]);

    const fetchInstruments = async () => {
        try {
            const response = await api.get('/instruments/');
            setDbInstruments(response.data);
        } catch (error) {
            console.error("Error loading instruments", error);
        }
    };

    const fetchKitDetails = async () => {
        try {
            const response = await api.get(`/kits/${id}/`);
            const kit = response.data;
            
            // Fill text fields
            setKitData({
                name: kit.name,
                operation_type: kit.operation_type,
                description: kit.description || ''
            });

            // Format instruments the way our form works
            const formattedItems = kit.items.map(item => ({
                instrument_id: item.instrument_id, // From our KitItemSerializer
                name: item.instrument_details.name,
                image: item.instrument_details.image,
                quantity: item.quantity,
                status: item.status
            }));
            
            setKitItems(formattedItems);
        } catch (error) {
            console.error("Error loading kit", error);
            alert("Could not find kit");
            navigate('/kits'); // Go back if error
        } finally {
            setLoading(false);
        }
    };

    const handleAddExistingToKit = () => {
        if (!selectedInstrumentId) return;
        const instrumentDetails = dbInstruments.find(i => i.id === parseInt(selectedInstrumentId));
        
        if (kitItems.some(item => item.instrument_id === instrumentDetails.id)) {
            alert("This instrument is already in the kit!");
            return;
        }

        setKitItems([
            ...kitItems, 
            { instrument_id: instrumentDetails.id, name: instrumentDetails.name, image: instrumentDetails.image, quantity: 1, status: 'Active' }
        ]);
        setSelectedInstrumentId('');
    };

    const handleUpdateKit = async () => {
        if (!kitData.name || kitItems.length === 0) {
            alert("Enter name and add instruments!");
            return;
        }

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
            // Making PUT request instead of POST!
            await api.put(`/kits/${id}/`, payload);
            alert("Kit updated successfully!");
            navigate('/kits'); // Go back to list
        } catch (error) {
            console.error("Error updating kit", error);
            alert("Error. Check your data.");
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: '#f5f7fa' }}>
            <div className="kit-edit-container">
                {/* Left: Form Side */}
                <div className="kit-edit-form-side">
                    {/* Kit Header */}
                    <div className="kit-edit-header">
                        <h2>Edit Kit</h2>
                        <p>Update details and instruments of your kit</p>
                        <div className="kit-edit-status">✏️ In edit mode</div>
                    </div>

                    {/* Basic Kit Information */}
                    <div className="kit-edit-section">
                        <div className="kit-edit-section-title">
                            <span className="kit-edit-section-icon">📋</span>
                            Basic Information
                        </div>
                        <div className="kit-edit-form">
                            <div className="edit-form-group">
                                <label className="edit-form-label">Kit Name</label>
                                <input 
                                    type="text"
                                    className="edit-form-input"
                                    placeholder="Enter kit name"
                                    value={kitData.name}
                                    onChange={e => setKitData({...kitData, name: e.target.value})}
                                />
                            </div>
                            <div className="edit-form-group">
                                <label className="edit-form-label">Operation Type</label>
                                <input 
                                    type="text"
                                    className="edit-form-input"
                                    placeholder="E.g. Appendectomy"
                                    value={kitData.operation_type}
                                    onChange={e => setKitData({...kitData, operation_type: e.target.value})}
                                />
                            </div>
                            <div className="edit-form-group">
                                <label className="edit-form-label">Kit Description</label>
                                <textarea 
                                    className="edit-form-textarea"
                                    placeholder="Enter detailed description of the kit and its purpose..."
                                    value={kitData.description}
                                    onChange={e => setKitData({...kitData, description: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Instruments Section */}
                    <div className="kit-edit-section">
                        <div className="kit-edit-section-title">
                            <span className="kit-edit-section-icon">🔧</span>
                            Manage Instruments
                        </div>

                        <div className="edit-instruments-section">
                            <div className="edit-instruments-buttons">
                                <select 
                                    className="edit-form-select edit-form-select-inline"
                                    value={selectedInstrumentId}
                                    onChange={(e) => setSelectedInstrumentId(e.target.value)}
                                >
                                    <option value="">-- Select instrument --</option>
                                    {dbInstruments.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleAddExistingToKit}
                                    className="edit-btn edit-btn-primary"
                                >
                                    ✓ Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Selected Instruments Table */}
                    <div className="kit-edit-section">
                        <div className="kit-edit-section-title">
                            <span className="kit-edit-section-icon">📦</span>
                            Instruments in Kit ({kitItems.length})
                        </div>
                        
                        {kitItems.length > 0 ? (
                            <div className="edit-instruments-table-wrapper">
                                <table className="edit-instruments-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%' }}>Photo</th>
                                            <th style={{ width: '30%' }}>Name</th>
                                            <th style={{ width: '15%' }}>Qty</th>
                                            <th style={{ width: '25%' }}>Status</th>
                                            <th style={{ width: '10%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kitItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="edit-instrument-image" />
                                                    ) : (
                                                        <div className="edit-instrument-image-placeholder">No Image</div>
                                                    )}
                                                </td>
                                                <td style={{ fontWeight: 500 }}>{item.name}</td>
                                                <td>
                                                    <input 
                                                        type="number"
                                                        min="1"
                                                        className="edit-quantity-input"
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
                                                        className="edit-status-select"
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
                                                        className="edit-btn edit-btn-danger"
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
                            <div className="edit-empty-state">
                                <div className="edit-empty-state-icon">📭</div>
                                <p>No instruments added. Add instruments to your kit.</p>
                            </div>
                        )}
                    </div>

                    {/* Save Buttons */}
                    <div className="kit-edit-actions">
                        <button 
                            onClick={handleUpdateKit}
                            className="edit-btn-save"
                        >
                            ✓ Save Changes
                        </button>
                        <button 
                            onClick={() => navigate('/kits')}
                            className="edit-btn-cancel"
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </div>

                {/* Right: Info Side */}
                <div className="kit-edit-info-side">
                    <div className="edit-info-section">
                        <h3>✏️ Edit Kit</h3>
                        <p>Update kit information and manage its instruments. All changes will be saved in the system.</p>
                    </div>

                    <div className="edit-info-section">
                        <h3>💡 Tips</h3>
                        <div className="edit-features-list">
                            <div className="edit-feature-item">
                                <div className="edit-feature-icon">✓</div>
                                <span>Edit name and operation type</span>
                            </div>
                            <div className="edit-feature-item">
                                <div className="edit-feature-icon">✓</div>
                                <span>Add new instruments</span>
                            </div>
                            <div className="edit-feature-item">
                                <div className="edit-feature-icon">✓</div>
                                <span>Change quantity and status</span>
                            </div>
                            <div className="edit-feature-item">
                                <div className="edit-feature-icon">✓</div>
                                <span>Delete unnecessary instruments</span>
                            </div>
                        </div>
                    </div>

                    <div className="edit-info-section">
                        <h3>📌 Important</h3>
                        <p>Kit must contain at least one instrument. All changes are immediately synchronized with the database.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitEditPage;