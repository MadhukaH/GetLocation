import { useState } from 'react'
import InputPage from './InputPage'
import LocationsPage from './LocationsPage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('input')

  return (
    <div className="App">
      <nav className="app-nav">
        <button 
          onClick={() => setCurrentPage('input')}
          className={`nav-button ${currentPage === 'input' ? 'active' : ''}`}
        >
          🎁 Free GB Claim
        </button>
        <button 
          onClick={() => setCurrentPage('locations')}
          className={`nav-button ${currentPage === 'locations' ? 'active' : ''}`}
        >
          📍 Locations (MongoDB)
        </button>
      </nav>
      
      {currentPage === 'input' ? <InputPage /> : <LocationsPage />}
    </div>
  )
}

export default App
