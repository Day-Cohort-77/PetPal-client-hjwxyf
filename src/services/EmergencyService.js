import { get, post, put, del } from './apiService';


export const getAllEmergencyServices = async (latitude = null, longitude = null) => {
    let endpoint = ('/api/emergency-services');
    if (latitude && longitude) {
        endpoint = `/api/emergency-services?latitude=${latitude}&longitude=${longitude}`;
    }

    return get(endpoint);
};
