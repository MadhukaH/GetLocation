import { useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import './InputPage.css'

// Constants
const GB_OPTIONS = [
  { value: '1', label: '1 GB', popular: false },
  { value: '2', label: '2 GB', popular: false },
  { value: '5', label: '5 GB', popular: true },
  { value: '10', label: '10 GB', popular: false },
  { value: '20', label: '20 GB', popular: false },
  { value: 'other', label: 'Other', popular: false }
]

const PHONE_REGEX = /^\(\d{3}\) \d{3}-\d{4}$/
const COUNTRY_CODE = '+94'
const API_BASE_URL = 'http://localhost:3001/api'

// Custom hooks
const useFormValidation = (phoneNumber) => {
  return useMemo(() => {
    const isValid = PHONE_REGEX.test(phoneNumber)
    return {
      isValid,
      error: isValid ? null : 'Please enter a valid phone number'
    }
  }, [phoneNumber])
}

const usePhoneFormatter = () => {
  const formatPhoneNumber = useCallback((value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else if (digits.length > 0) {
      return `(${digits}`
    }
    return ''
  }, [])

  return { formatPhoneNumber }
}

// Components
const PhoneInput = ({ value, onChange, error, disabled }) => {
  const { formatPhoneNumber } = usePhoneFormatter()
  
  const handleChange = useCallback((e) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange(formatted)
  }, [formatPhoneNumber, onChange])

  return (
    <div className="phone-input-container">
      <input 
        type="text" 
        className="country-code" 
        value={COUNTRY_CODE} 
        readOnly 
        disabled={disabled}
        aria-label="Country code"
      />
      <input 
        type="tel" 
        className={`phone-number ${error ? 'error' : ''}`}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        maxLength={14}
        aria-label="Phone number"
        aria-invalid={!!error}
        aria-describedby={error ? 'phone-error' : undefined}
      />
      {error && (
        <div id="phone-error" className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

const GBSelector = ({ options, selectedValue, onSelect, disabled }) => {
  return (
    <div className="gb-buttons" role="radiogroup" aria-label="Select data amount">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`gb-button ${selectedValue === option.value ? 'selected' : ''} ${option.popular ? 'popular' : ''}`}
          onClick={() => onSelect(option.value)}
          disabled={disabled}
          role="radio"
          aria-checked={selectedValue === option.value}
          aria-label={`Select ${option.label}`}
        >
          {option.label}
          {option.popular && <span className="popular-badge">Most Popular</span>}
        </button>
      ))}
    </div>
  )
}

const LoadingSpinner = () => (
  <div className="loading-spinner" aria-label="Loading">
    <div className="spinner"></div>
  </div>
)

// Location hook
const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      setIsGettingLocation(true)
      setLocationError(null)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          }
          setLocation(locationData)
          setIsGettingLocation(false)
          resolve(locationData)
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }
          setLocationError(errorMessage)
          setIsGettingLocation(false)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }, [])

  return { location, locationError, isGettingLocation, getCurrentLocation }
}

// Main Component
const InputPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedGB, setSelectedGB] = useState('5')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  
  const { isValid, error } = useFormValidation(phoneNumber)
  const { getCurrentLocation, isGettingLocation } = useGeolocation()
  const isFormValid = isValid && selectedGB && !isLoading

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!isFormValid) return
    
    setIsLoading(true)
    setSubmitError(null)
    
    try {
      // Get current location
      console.log('📍 Getting current location...')
      const locationData = await getCurrentLocation()
      console.log('📍 Location obtained:', locationData)
      
      // Prepare data for API
      const claimData = {
        phoneNumber: `${COUNTRY_CODE} ${phoneNumber}`,
        selectedGB: GB_OPTIONS.find(opt => opt.value === selectedGB)?.label,
        location: locationData
      }
      
      console.log('📤 Submitting claim data:', claimData)
      
      // Submit to backend API
      const response = await axios.post(`${API_BASE_URL}/claim-data`, claimData)
      
      if (response.data.success) {
        console.log('✅ Claim submitted successfully:', response.data)
        setIsSubmitted(true)
      } else {
        throw new Error(response.data.error || 'Failed to submit claim')
      }
      
    } catch (error) {
      console.error('❌ Error claiming free GB:', error)
      
      if (error.response?.data?.error) {
        setSubmitError(error.response.data.error)
      } else if (error.message.includes('location')) {
        setSubmitError('Unable to get your location. Please enable location access and try again.')
      } else {
        setSubmitError('Failed to submit your claim. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [isFormValid, phoneNumber, selectedGB, getCurrentLocation])

  const handleGBSelect = useCallback((value) => {
    setSelectedGB(value)
  }, [])

  if (isSubmitted) {
    return (
      <div className="input-page">
        <div className="card success-card">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h1>Success!</h1>
            <p>Your free data claim has been submitted successfully.</p>
            <p>You will receive a confirmation message shortly.</p>
            <button 
              className="claim-button"
              onClick={() => {
                setIsSubmitted(false)
                setPhoneNumber('')
                setSelectedGB('5')
              }}
            >
              Claim Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="input-page">
      <div className="card">
        {/* Header Section */}
        <header className="header">
          <div className="header-content">
            <div className="gift-icon" role="img" aria-label="Gift box">🎁</div>
            <h1>Get Free GB</h1>
            <p>Enter your phone number to claim your free data</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="content">
          <form onSubmit={handleSubmit} noValidate>
            {/* Phone Number Section */}
            <fieldset className="input-section">
              <legend className="label">Phone Number</legend>
              <PhoneInput 
                value={phoneNumber}
                onChange={setPhoneNumber}
                error={error}
                disabled={isLoading}
              />
            </fieldset>

            {/* GB Selection Section */}
            <fieldset className="gb-section">
              <legend className="label">Select GB Amount</legend>
              <GBSelector 
                options={GB_OPTIONS}
                selectedValue={selectedGB}
                onSelect={handleGBSelect}
                disabled={isLoading}
              />
            </fieldset>

            {/* Error Message */}
            {submitError && (
              <div className="error-message" role="alert">
                {submitError}
              </div>
            )}

            {/* Claim Button */}
            <button 
              type="submit"
              className={`claim-button ${!isFormValid ? 'disabled' : ''}`}
              disabled={!isFormValid}
              aria-describedby="button-description"
            >
              {isLoading ? (
                <div className="loading-content">
                  <LoadingSpinner />
                  <span>{isGettingLocation ? 'Getting Location...' : 'Submitting...'}</span>
                </div>
              ) : (
                'Claim Free GB'
              )}
            </button>
            <div id="button-description" className="sr-only">
              {isFormValid ? 'Submit your free data claim with location' : 'Please fill in all required fields'}
            </div>
          </form>

          {/* Security Message */}
          <div className="security-message" role="status">
            <span className="lock-icon" role="img" aria-label="Security lock">🔒</span>
            <span>Your information is secure and encrypted</span>
          </div>

          {/* Terms and Privacy */}
          <div className="terms">
            <span>By clicking "Claim Free GB", you agree to our </span>
            <a href="/terms" className="link" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
            <span> and </span>
            <a href="/privacy" className="link" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}

export default InputPage
