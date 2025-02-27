import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface DistanceResponse {
  duration: number; // in minutes
  distance: number; // in kilometers
}

export async function calculateTravelTime(
  originAddress: string,
  destinationAddress: string,
): Promise<DistanceResponse> {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins: originAddress,
          destinations: destinationAddress,
          key: GOOGLE_MAPS_API_KEY,
        },
      },
    );

    const data = response.data;
    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      return {
        duration: Math.ceil(data.rows[0].elements[0].duration.value / 60), // Convert seconds to minutes
        distance: data.rows[0].elements[0].distance.value / 1000, // Convert meters to kilometers
      };
    }

    throw new Error('Unable to calculate travel time');
  } catch (error) {
    console.error('Error calculating travel time:', error);
    // Return a default travel time of 30 minutes as fallback
    return { duration: 30, distance: 10 };
  }
}
