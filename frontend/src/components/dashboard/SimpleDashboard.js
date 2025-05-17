import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ServiceContext } from '../../context/ServiceContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Simplified Dashboard with pure HTML elements
const SimpleDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { 
    getProviderServices, 
    createService,
    loading: serviceLoading,
    error: serviceError 
  } = useContext(ServiceContext);
  
  const [activeTab, setActiveTab] = useState('services');
  const [providerServices, setProviderServices] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'medical',
    location: {
      address: '',
      city: '',
      region: ''
    }
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const isProvider = user && user.role === 'provider';
  
  // Fetch provider services
  useEffect(() => {
    if (isProvider && activeTab === 'services') {
      const loadServices = async () => {
        try {
          const services = await getProviderServices();
          setProviderServices(services || []);
        } catch (err) {
          console.error('Error fetching provider services:', err);
        }
      };
      
      loadServices();
    }
  }, [isProvider, activeTab, getProviderServices]);

  // Tab change handler
  const showTab = (tabName) => {
    setActiveTab(tabName);
  };
  
  // Service form handlers
  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setFormError('');
    setSuccessMessage('');
  };
  
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    // Reset form
    setServiceForm({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: 'medical',
      location: {
        address: '',
        city: '',
        region: ''
      }
    });
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields like location.city
      const [parent, field] = name.split('.');
      setServiceForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      }));
    } else {
      setServiceForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmitService = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    
    // Validate form
    if (!serviceForm.name || !serviceForm.description || !serviceForm.price) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    try {
      const numericPrice = parseFloat(serviceForm.price);
      if (isNaN(numericPrice)) {
        setFormError('Price must be a valid number');
        return;
      }
      
      // Format data for API
      const serviceData = {
        ...serviceForm,
        price: numericPrice,
        duration: parseInt(serviceForm.duration) || 60
      };
      
      // Submit to API
      await createService(serviceData);
      
      // Refresh services list
      const updatedServices = await getProviderServices();
      setProviderServices(updatedServices || []);
      
      setSuccessMessage('Service added successfully!');
      
      // Close form after brief delay
      setTimeout(() => {
        handleCloseAddForm();
        setSuccessMessage('');
      }, 2000);
      
    } catch (err) {
      setFormError(err.message || 'Error creating service');
      console.error('Error adding service:', err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '10px' }}>{t('dashboard.title')}</h1>
      <p style={{ marginBottom: '20px' }}>{t('dashboard.description')}</p>
      
      {/* Simple Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #ccc', 
        marginBottom: '20px' 
      }}>
        <button 
          onClick={() => showTab('bookings')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'bookings' ? '#1976d2' : 'transparent',
            color: activeTab === 'bookings' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'bookings' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'bookings' ? 'bold' : 'normal'
          }}
        >
          {t('dashboard.myBookings')}
        </button>
        
        <button 
          onClick={() => showTab('profile')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'profile' ? '#1976d2' : 'transparent',
            color: activeTab === 'profile' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'profile' ? 'bold' : 'normal'
          }}
        >
          {t('dashboard.profile')}
        </button>
        
        {isProvider && (
          <button 
            onClick={() => showTab('services')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'services' ? '#1976d2' : 'transparent',
              color: activeTab === 'services' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'services' ? '2px solid #1976d2' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'services' ? 'bold' : 'normal'
            }}
          >
            {t('dashboard.myServices')}
          </button>
        )}
      </div>
      
      {/* Content Area - Using static content instead of dynamic loading */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        border: '1px solid #ddd',
        borderRadius: '4px',
        minHeight: '400px'
      }}>
        {/* Bookings Tab Content */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ marginBottom: '15px' }}>{t('dashboard.myBookings')}</h2>
            
            {/* Static Booking Status Tabs */}
            <div style={{ 
              display: 'flex', 
              marginBottom: '20px', 
              borderBottom: '1px solid #eee'
            }}>
              <button style={{ padding: '8px 12px', backgroundColor: '#f5f5f5', border: 'none', marginRight: '5px' }}>{t('bookings.all')}</button>
              <button style={{ padding: '8px 12px', backgroundColor: 'transparent', border: 'none', marginRight: '5px' }}>{t('bookings.upcoming')}</button>
              <button style={{ padding: '8px 12px', backgroundColor: 'transparent', border: 'none', marginRight: '5px' }}>{t('bookings.completed')}</button>
              <button style={{ padding: '8px 12px', backgroundColor: 'transparent', border: 'none' }}>{t('bookings.cancelled')}</button>
            </div>
            
            {/* Static No Bookings Message */}
            <div style={{ 
              textAlign: 'center', 
              padding: '30px', 
              color: '#666'
            }}>
              <p style={{ marginBottom: '15px' }}>{t('bookings.noBookings')}</p>
              <Link to="/services" style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}>
                {t('bookings.browseServices')}
              </Link>
            </div>
          </div>
        )}
        
        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ marginBottom: '15px' }}>{t('profile.title')}</h2>
            <p>{t('profile.description')}</p>
            
            {/* Static Profile Fields */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t('profile.name')}</label>
                <input type="text" defaultValue={user?.name || ''} style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }} disabled />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t('profile.email')}</label>
                <input type="email" defaultValue={user?.email || ''} style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }} disabled />
              </div>
            </div>
          </div>
        )}
        
        {/* Services Tab Content (for providers) */}
        {activeTab === 'services' && isProvider && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{t('dashboard.myServices')}</h2>
              <button 
                onClick={handleOpenAddForm}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span style={{ fontSize: '18px' }}>+</span> {t('services.addService')}
              </button>
            </div>
            <p>{t('services.noServices')}</p>
            
            {/* Service listing or empty state message */}
            {serviceLoading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                {t('common.loading')}
              </div>
            ) : providerServices.length > 0 ? (
              <div style={{ marginTop: '20px' }}>
                {providerServices.map(service => (
                  <div key={service._id} style={{
                    padding: '15px',
                    marginBottom: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h3 style={{ margin: '0 0 10px 0' }}>{service.name}</h3>
                      <span style={{ fontWeight: 'bold' }}>${service.price}</span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>{service.description}</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        {service.category}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        {service.duration || 60} {t('services.minutes')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px', 
                color: '#666',
                marginTop: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px'
              }}>
                <p>{t('services.noServices')}</p>
                <p style={{ marginTop: '10px', fontSize: '14px' }}>{t('services.addFirstService')}</p>
              </div>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: '#4caf50',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                zIndex: 1000
              }}>
                {t('services.form.success')}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add Service Form Dialog */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '4px',
            padding: '20px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{t('services.form.title')}</h2>
              <button
                onClick={handleCloseAddForm}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            {formError && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmitService}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  {t('services.form.nameLabel')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={serviceForm.name}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  {t('services.form.descriptionLabel')}
                </label>
                <textarea
                  name="description"
                  value={serviceForm.description}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    minHeight: '100px'
                  }}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    {t('services.form.priceLabel')}
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={serviceForm.price}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    {t('services.form.durationLabel')}
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={serviceForm.duration}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    placeholder="60"
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  {t('services.form.categoryLabel')}
                </label>
                <select
                  name="category"
                  value={serviceForm.category}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="medical">{t('services.form.categories.medical')}</option>
                  <option value="wellness">{t('services.form.categories.wellness')}</option>
                  <option value="homecare">{t('services.form.categories.homecare')}</option>
                  <option value="therapy">{t('services.form.categories.therapy')}</option>
                  <option value="other">{t('services.form.categories.other')}</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  {t('services.form.locationLabel')}
                </label>
                <input
                  type="text"
                  name="location.address"
                  placeholder={t('services.form.addressPlaceholder')}
                  value={serviceForm.location.address}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '5px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    name="location.city"
                    placeholder={t('services.form.cityPlaceholder')}
                    value={serviceForm.location.city}
                    onChange={handleFormChange}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                  <input
                    type="text"
                    name="location.region"
                    placeholder={t('services.form.regionPlaceholder')}
                    value={serviceForm.location.region}
                    onChange={handleFormChange}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={handleCloseAddForm}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {serviceLoading ? t('services.form.adding') : t('services.form.addButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDashboard;
