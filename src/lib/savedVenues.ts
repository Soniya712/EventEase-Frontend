import axios from 'axios';

export const toggleSaveVenue = async (venueId: number, currentSaved: boolean): Promise<boolean> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');

  if (!currentSaved) {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/saved-venues/${venueId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error: any) {
      // If the venue is already saved (409 Conflict), treat it as a successful save
      if (error.response?.status === 409) {
        return true;
      }
      throw error;
    }
  } else {
    // Unsave the venue
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/user/saved-venues/${venueId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return false;
  }
};