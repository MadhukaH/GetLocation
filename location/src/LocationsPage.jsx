import { useState, useEffect } from 'react'
import './LocationsPage.css'

const LocationsPage = () => {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addingLocation, setAddingLocation] = useState(false)

  // Form state for adding new location
  const [newLocation, setNewLocation] = useState({
    name: '',
    latitude: '',
    longitude: '',
    description: ''
  })

  // Fetch locations from Netlify function
  const fetchLocations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Call the Netlify function
      const response = await fetch('/.netlify/functions/get-locations')
      const data = await response.json()
      
      if (data.success) {
        setLocations(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch locations')
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add new location
  const addLocation = async (e) => {
    e.preventDefault()
    
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setAddingLocation(true)
      setError(null)

      const response = await fetch('/.netlify/functions/add-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLocation)
      })

      const data = await response.json()

      if (data.success) {
        // Add the new location to the list
        setLocations(prev => [...prev, data.data])
        // Reset form
        setNewLocation({
          name: '',
          latitude: '',
          longitude: '',
          description: ''
        })
        setShowAddForm(false)
      } else {
        throw new Error(data.message || 'Failed to add location')
      }
    } catch (err) {
      console.error('Error adding location:', err)
      setError(err.message)
    } finally {
      setAddingLocation(false)
    }
  }

  // Load locations on component mount
  useEffect(() => {
    fetchLocations()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewLocation(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewLocation(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }))
      },
      (error) => {
        setError('Unable to get your current location')
        console.error('Geolocation error:', error)
      }
    )
  }

  if (loading) {
    return (
      <div className="locations-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading locations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="locations-page">
      <div className="container">
        <header className="page-header">
          <h1>📍 Location Manager</h1>
          <p>View and manage saved locations from MongoDB Atlas</p>
        </header>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
            <button onClick={() => setError(null)} className="close-error">×</button>
          </div>
        )}

        <div className="actions">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="add-button"
          >
            {showAddForm ? 'Cancel' : '+ Add New Location'}
          </button>
          <button 
            onClick={fetchLocations}
            className="refresh-button"
          >
            🔄 Refresh
          </button>
        </div>

        {showAddForm && (
          <div className="add-form-container">
            <form onSubmit={addLocation} className="add-form">
              <h3>Add New Location</h3>
              
              <div className="form-group">
                <label htmlFor="name">Location Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newLocation.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Central Park"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude *</label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={newLocation.latitude}
                    onChange={handleInputChange}
                    placeholder="40.7829"
                    step="any"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">Longitude *</label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={newLocation.longitude}
                    onChange={handleInputChange}
                    placeholder="-73.9654"
                    step="any"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={getCurrentLocation}
                className="get-location-button"
              >
                📍 Use Current Location
              </button>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newLocation.description}
                  onChange={handleInputChange}
                  placeholder="Optional description..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={addingLocation}
                  className="submit-button"
                >
                  {addingLocation ? 'Adding...' : 'Add Location'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="locations-grid">
          {locations.length === 0 ? (
            <div className="no-locations">
              <p>No locations found. Add some locations to get started!</p>
            </div>
          ) : (
            locations.map((location) => (
              <div key={location._id} className="location-card">
                <h3>{location.name}</h3>
                <div className="location-coords">
                  <span className="coord">
                    <strong>Lat:</strong> {location.latitude}
                  </span>
                  <span className="coord">
                    <strong>Lng:</strong> {location.longitude}
                  </span>
                </div>
                {location.description && (
                  <p className="description">{location.description}</p>
                )}
                <div className="location-meta">
                  <small>
                    Added: {new Date(location.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <div className="location-actions">
                  <a
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    🗺️ View on Map
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationsPage
