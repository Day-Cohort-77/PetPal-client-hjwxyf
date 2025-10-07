'use client';

import { Container, Flex, Box, Heading, Text, Card, Grid, Spinner, Link, Badge } from '@radix-ui/themes';
import Navbar from '../../components/Navbar';
import { getAllEmergencyServices } from '../../services/EmergencyService';
import { useState, useEffect } from 'react';
import EmergencyMap from '../../components/EmergencyMap';   
import { set } from 'react-hook-form';

export default function EmergencyServices() {
    const [services, setServices] = useState([]);
    const [guidelines, setGuidelines] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    


    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);

    const getUserLocation = () => {
        if (!navigator.geolocation) 
        {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                setUserLocation(location);
                console.log('User location:', location);
                
            }
        );
    };
    useEffect(() => {
        getUserLocation();
    }, []); 

    useEffect(() => {
        if (!userLocation) return; // Don't fetch until we have location

        const fetchServices = async () => {
            try {
                const response = await getAllEmergencyServices(
                    userLocation.latitude,
                    userLocation.longitude
                );
                console.log('API Response:', response);

                setServices(response.emergencyServices || []);
                setGuidelines(response.emergencyGuidelines || null);
            } catch (err) {
                console.error('Error fetching emergency services:', err);
                setError('Failed to load emergency services. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, [userLocation]); 

    // Format address from Address object
    const formatAddress = (address) => {
        if (!address) return 'Address not available';

        return [
            address.street,
            address.city,
            address.state,
            address.zipCode,
            address.country
        ].filter(Boolean).join(', ');
    };

    // Format hours from Hours object
    const formatHours = (hours) => {
        if (!hours) return 'Hours not available';

        if (hours.is24Hour) return '24 hours / 7 days';

        if (!hours.regularHours || hours.regularHours.length === 0) {
            return hours.isOpen ? 'Currently Open' : 'Currently Closed';
        }

        // If we have regular hours, format them nicely
        return hours.regularHours.map(h =>
            `${h.day}: ${h.open} - ${h.close}`
        ).join(', ');
    };

    // Format wait time
    const formatWaitTime = (waitTime) => {
        if (!waitTime || !waitTime.estimatedMinutes) return null;

        const mins = waitTime.estimatedMinutes;
        return `${mins} minute${mins !== 1 ? 's' : ''} wait`;
    };

    // Format distance
    const formatDistance = (distance) => {
        if (!distance || !distance.miles) return null;

        return `${distance.miles.toFixed(1)} miles away`;
    };
    const handleNewClinicsFound = (newClinics) => {
        // Combine with existing clinics, avoiding duplicates by ID
        setServices(prevServices => {
            const existingIds = new Set(prevServices.map(s => s.id));
            const uniqueNewClinics = newClinics.filter(c => !existingIds.has(c.id));

            return [...prevServices, ...uniqueNewClinics];
        });
    };

    return (
        <>
            <Navbar />
            <Container size="3" py="6">
                <Flex direction="column" gap="4">
                    <Box mb="4">
                        <Heading size="8" mb="2">Emergency Pet Services</Heading>
                        <Text size="3">Find 24/7 emergency care for your pets</Text>
                    </Box>

                    {/* Emergency Guidelines */}
                    {guidelines && (
                        <Card mb="4">
                            <Heading size="5" mb="2">Emergency Guidelines</Heading>

                            {guidelines.commonEmergencySigns && guidelines.commonEmergencySigns.length > 0 && (
                                <Box mb="3">
                                    <Heading size="3" mb="2">Signs of Emergency:</Heading>
                                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                        {guidelines.commonEmergencySigns.map((sign, i) => (
                                            <li key={i}><Text>{sign}</Text></li>
                                        ))}
                                    </ul>
                                </Box>
                            )}

                            {guidelines.immediateActions && guidelines.immediateActions.length > 0 && (
                                <Box>
                                    <Heading size="3" mb="2">Immediate Actions:</Heading>
                                    <ol style={{ paddingLeft: '20px', margin: 0 }}>
                                        {guidelines.immediateActions.map((action, i) => (
                                            <li key={i}><Text>{action}</Text></li>
                                        ))}
                                    </ol>
                                </Box>
                            )}
                        </Card>
                    )}

                    {error && (
                        <Card>
                            <Text color="red" size="3">{error}</Text>
                        </Card>
                    )}
                    
                    {!isLoading && services.length > 0 && (
                        <Card mb="4">
                            <EmergencyMap
                                clinics={services}
                                userLocation={userLocation}
                                onNewClinicsFound={handleNewClinicsFound}
                            />
                        </Card>
                    )}


                    {isLoading ? (
                        <Flex align="center" justify="center" py="9">
                            <Spinner size="large" />
                            <Text ml="3">Loading emergency services...</Text>
                        </Flex>
                    ) : (
                        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
                            {services.map((service) => (
                                <Card key={service.id}>
                                    <Flex gap="3" direction="column">
                                        <Flex justify="between" align="center">
                                            <Heading size="4">{service.name}</Heading>
                                            {service.hours?.is24Hour && (
                                                <Badge color="red">24/7</Badge>
                                            )}
                                        </Flex>

                                        <Flex align="center" gap="2">
                                            <Text size="2" color="gray" style={{ fontStyle: 'italic' }}>{service.type || 'Emergency Vet'}</Text>
                                            {service.waitTime && (
                                                <Badge color={service.waitTime.estimatedMinutes < 30 ? 'green' : 'orange'}>
                                                    {formatWaitTime(service.waitTime)}
                                                </Badge>
                                            )}
                                        </Flex>

                                        <Box>
                                            <Text weight="bold" size="2">Address:</Text>
                                            <Text size="2" color="gray">
                                                {formatAddress(service.address)}
                                            </Text>
                                        </Box>

                                        {service.distance && (
                                            <Text size="2" color="gray">
                                                {formatDistance(service.distance)}
                                                {service.distance.estimatedDriveTimeMinutes && (
                                                    <> ({service.distance.estimatedDriveTimeMinutes} min drive)</>
                                                )}
                                            </Text>
                                        )}

                                        {service.contact?.phone && (
                                            <Box>
                                                <Flex gap="2" align="center">
                                                    <Text weight="bold" color="red">
                                                        {service.contact.phone}
                                                    </Text>
                                                    <Link
                                                        asChild
                                                        href={`tel:${service.contact.phone.replace(/\D/g, '')}`}
                                                        style={{ marginLeft: 'auto' }}
                                                    >
                                                        <button style={{
                                                            backgroundColor: 'var(--red-9)',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '4px 12px',
                                                            borderRadius: 'var(--radius-2)',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: 'var(--font-size-2)'
                                                        }}>
                                                            Call
                                                        </button>
                                                    </Link>
                                                </Flex>
                                            </Box>
                                        )}

                                        <Box>
                                            <Text weight="bold" size="2">Hours:</Text>
                                            <Text size="2">
                                                {formatHours(service.hours)}
                                            </Text>
                                        </Box>

                                        {service.contact?.website && (
                                            <Box>
                                                <Text weight="bold" size="2">Website:</Text>
                                                <Link href={service.contact.website} target="_blank">
                                                    Visit Website
                                                </Link>
                                            </Box>
                                        )}

                                        {service.services && service.services.length > 0 && (
                                            <Box>
                                                <Text weight="bold" size="2" mb="1">Services:</Text>
                                                <Flex gap="2" wrap="wrap">
                                                    {service.services.map((item, i) => (
                                                        <Box
                                                            key={i}
                                                            style={{
                                                                background: 'var(--red-3)',
                                                                padding: '4px 8px',
                                                                borderRadius: 'var(--radius-2)',
                                                                fontSize: 'var(--font-size-1)'
                                                            }}
                                                        >
                                                            {item}
                                                        </Box>
                                                    ))}
                                                </Flex>
                                            </Box>
                                        )}

                                        {service.directions && (service.directions.googleMapsUrl || service.directions.appleMapsUrl) && (
                                            <Box>
                                                <Text weight="bold" size="2">Directions:</Text>
                                                <Flex gap="3" mt="1">
                                                    {service.directions.googleMapsUrl && (
                                                        <Link href={service.directions.googleMapsUrl} target="_blank">
                                                            Google Maps
                                                        </Link>
                                                    )}
                                                    {service.directions.appleMapsUrl && (
                                                        <Link href={service.directions.appleMapsUrl} target="_blank">
                                                            Apple Maps
                                                        </Link>
                                                    )}
                                                </Flex>
                                            </Box>
                                        )}
                                    </Flex>
                                </Card>
                            ))}
                        </Grid>
                    )}
                </Flex>
            </Container>
        </>
    );
}