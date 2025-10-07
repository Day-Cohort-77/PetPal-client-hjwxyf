'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, Text } from '@radix-ui/themes';

const mapContainerStyle = {
    width: '100%',
    height: '500px'
};

const libraries = ["places"];

export default function EmergencyMap({ clinics, userLocation, onNewClinicsFound }) {
    const [map, setMap] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [nearbyVets, setNearbyVets] = useState([]);
    const [searchStatus, setSearchStatus] = useState('');
    const hasSearched = useRef(false);

    const center = userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : { lat: 36.1627, lng: -86.7816 };

    const onMapLoad = useCallback((map) => {
        console.log('✅ Map loaded');
        setMap(map);
    }, []);

    function calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
        const R = 3958.8;
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    useEffect(() => {
        if (!map || !userLocation || !window.google || hasSearched.current) {
            return;
        }

        console.log('🔍 Starting search for emergency vets near:', userLocation);
        setSearchStatus('Finding emergency vets near you...');
        hasSearched.current = true;

        const service = new window.google.maps.places.PlacesService(map);

    
        const request = {
            location: new window.google.maps.LatLng(
                userLocation.latitude,
                userLocation.longitude
            ),
            radius: 50000,
            keyword: 'emergency veterinary animal hospital',
            type: 'veterinary_care'
        };

        console.log('📡 Sending Places API request');

        service.nearbySearch(request, async (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                console.log('✅ Found', results.length, 'places');

                const topThree = results.slice(0, 3);
                console.log('🔍 Fetching details for top 3...');

                // Get details (including phone) for each place
                const detailedResults = await Promise.all(
                    topThree.map(place => {
                        return new Promise((resolve) => {
                            // This is the ONLY way to get phone numbers from Google Places API
                            service.getDetails(
                                {
                                    placeId: place.place_id,
                                    fields: ['formatted_phone_number', 'name', 'formatted_address']
                                },
                                (details, detailStatus) => {
                                    const lat = place.geometry.location.lat();
                                    const lng = place.geometry.location.lng();
                                    const distance = calculateDistance(
                                        userLocation.latitude,
                                        userLocation.longitude,
                                        lat,
                                        lng
                                    );

                                    const phone = detailStatus === window.google.maps.places.PlacesServiceStatus.OK
                                        ? details?.formatted_phone_number
                                        : null;

                                    console.log(`📞 ${place.name}: ${phone || 'No phone'} - ${distance.toFixed(1)}mi`);

                                    resolve({
                                        id: place.place_id,
                                        name: place.name,
                                        location: {
                                            latitude: lat,
                                            longitude: lng
                                        },
                                        address: {
                                            street: place.vicinity || place.formatted_address || 'Address unavailable',
                                        },
                                        distance: {
                                            miles: distance
                                        },
                                        type: 'Emergency Vet',
                                        contact: {
                                            phone: phone
                                        },
                                        directions: {
                                            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${place.place_id}`,
                                            appleMapsUrl: `http://maps.apple.com/?daddr=${lat},${lng}`
                                        }
                                    });
                                }
                            );
                        });
                    })
                );

                setNearbyVets(detailedResults);
                setSearchStatus(`Found ${detailedResults.length} emergency vets nearby`);

                if (onNewClinicsFound) {
                    onNewClinicsFound(detailedResults);
                }
            } else {
                setSearchStatus('No emergency vets found nearby');
            }
        });
    }, [map, userLocation]);

    const allClinics = (() => {
        const clinicMap = new Map();

        clinics.forEach(clinic => {
            if (clinic?.id) {
                clinicMap.set(clinic.id, clinic);
            }
        });

        nearbyVets.forEach(vet => {
            if (vet?.id && !clinicMap.has(vet.id)) {
                clinicMap.set(vet.id, vet);
            }
        });

        return Array.from(clinicMap.values()).sort((a, b) => {
            if (a.distance?.miles && b.distance?.miles) {
                return a.distance.miles - b.distance.miles;
            }
            return 0;
        });
    })();

    return (
        <>
            {searchStatus && (
                <Box p="2" mb="3" style={{
                    background: 'var(--blue-3)',
                    borderRadius: 'var(--radius-2)'
                }}>
                    <Text size="2" weight="bold">{searchStatus}</Text>
                </Box>
            )}

            <LoadScript
                googleMapsApiKey="AIzaSyAA-k5iYcC-xlVvVsRfFgTPQWWY3mujERw"
                libraries={libraries}
            >
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={11}
                    onLoad={onMapLoad}
                >
                    {userLocation && (
                        <Marker
                            position={{
                                lat: userLocation.latitude,
                                lng: userLocation.longitude
                            }}
                            icon={{
                                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                            }}
                            title="Your Location"
                        />
                    )}

                    {allClinics.map((clinic, index) => {
                        if (!clinic?.location?.latitude || !clinic?.location?.longitude) return null;

                        return (
                            <Marker
                                key={clinic.id}
                                position={{
                                    lat: clinic.location.latitude,
                                    lng: clinic.location.longitude
                                }}
                                title={clinic.name}
                                onClick={() => setSelectedClinic(clinic)}
                                label={{
                                    text: `${index + 1}`,
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            />
                        );
                    })}

                    {selectedClinic && (
                        <InfoWindow
                            position={{
                                lat: selectedClinic.location.latitude,
                                lng: selectedClinic.location.longitude
                            }}
                            onCloseClick={() => setSelectedClinic(null)}
                        >
                            <div style={{ padding: '8px', maxWidth: '250px' }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 'bold' }}>
                                    {selectedClinic.name}
                                </h4>
                                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>
                                    {selectedClinic.address?.street}
                                </p>
                                {selectedClinic.distance?.miles && (
                                    <p style={{ margin: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#d00' }}>
                                        📍 {selectedClinic.distance.miles.toFixed(1)} miles away
                                    </p>
                                )}
                                {selectedClinic.contact?.phone ? (
                                    <div style={{ marginTop: '8px' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: '12px' }}>
                                            📞 {selectedClinic.contact.phone}
                                        </p>
                                        <a
                                            href={`tel:${selectedClinic.contact.phone.replace(/\D/g, '')}`}
                                            style={{
                                                display: 'inline-block',
                                                backgroundColor: '#dc2626',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                textDecoration: 'none',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            📞 Call Now
                                        </a>
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '11px', color: '#999', margin: '8px 0 0' }}>
                                        Phone not available
                                    </p>
                                )}
                                {selectedClinic.directions?.googleMapsUrl && (
                                    <div style={{ marginTop: '8px' }}>
                                        <a
                                            href={selectedClinic.directions.googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-block',
                                                backgroundColor: '#2563eb',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                textDecoration: 'none',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🗺️ Get Directions
                                        </a>
                                    </div>
                                )}
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </LoadScript>
        </>
    );
}