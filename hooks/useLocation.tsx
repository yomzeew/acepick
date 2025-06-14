import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
interface LocationDataProps {
    coords: {
      latitude: number;
      longitude: number;
    };
  }
export const useCurrentLocation = () => {
  const [location, setLocation] = useState<LocationDataProps | null>(null);
  const [address, setAddress] = useState('');
  const [state,setState]=useState('')
  const [lga,setLga]=useState('')
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        // Request permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission not granted');
          setLoading(false);
          return;
        }

        // Get current coordinates
        let locationData:any = await Location.getCurrentPositionAsync({}) || '';
        setLocation(locationData);

        const { latitude, longitude } = locationData.coords;

        // Reverse geocode
        let addressArray = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addressArray.length > 0) {
          const firstAddress = addressArray[0];
          const fullAddress:string = `${firstAddress.name}, ${firstAddress.street}, ${firstAddress.city}, ${firstAddress.region}, ${firstAddress.country}`;
          setState(firstAddress.region||'')
          setLga(firstAddress.city || '')
          setAddress(fullAddress);
        }

      } catch (err:any) {
        setError(err.message || 'Error fetching location');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location, address,state,lga, loading, error };
};
