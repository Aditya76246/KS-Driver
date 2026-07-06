import * as Location from 'expo-location';
import { GOOGLE_API_KEY } from '@env';
import apiClient from '../api/apiClient';

// Module-level cache — full dataset fetched once per session, filtered client-side
const cache = {
  states:    null,
  districts: null,
  mandals:   null,
  villages:  null,
};

const locationService = {
  getStates: async () => {
    if (cache.states) return cache.states;
    const { data } = await apiClient.get('/Locations/states');
    cache.states = data.map((item) => ({
      id:   item.StateId,
      name: item.StateName,
    }));
    return cache.states;
  },

  // Fetches all districts once, then filters by stateId client-side
  getDistricts: async (stateId) => {
    if (!cache.districts) {
      const { data } = await apiClient.get('/Locations/districts');
      cache.districts = data.map((item) => ({
        id:      item.DistrictId,
        name:    item.DistrictName,
        stateId: item.StateId,
      }));
    }
    return cache.districts.filter((d) => d.stateId === stateId);
  },

  // Fetches all mandals once, then filters by districtId client-side
  getMandals: async (districtId) => {
    if (!cache.mandals) {
      const { data } = await apiClient.get('/Locations/mandals');
      cache.mandals = data.map((item) => ({
        id:         item.MandalId,
        name:       item.MandalName,
        districtId: item.DistrictId,
      }));
    }
    return cache.mandals.filter((m) => m.districtId === districtId);
  },

  // Fetches all villages once, then filters by mandalId client-side
  getVillages: async (mandalId) => {
    if (!cache.villages) {
      const { data } = await apiClient.get('/Locations/villages');
      cache.villages = data.map((item) => ({
        id:       item.VillageId,
        name:     item.VillageName,
        mandalId: item.MandalId,
      }));
    }
    return cache.villages.filter((v) => v.mandalId === mandalId);
  },

  getByPincode: async (pincode) => {
    const { data } = await apiClient.get(`/Locations/by-pincode/${pincode}`);
    return data;
  },

  // Requests GPS permission → gets coordinates → reverse-geocodes via Google → returns pincode string
  getCurrentLocationPincode: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      const err = new Error('Location access denied.');
      err.code = 'PERMISSION_DENIED';
      throw err;
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = pos.coords;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
    const res  = await fetch(url);
    const json = await res.json();

    if (json.status !== 'OK' || !json.results?.length) {
      const err = new Error('Could not reverse-geocode this location.');
      err.code = 'GEOCODE_FAILED';
      throw err;
    }

    // Walk through all results until we find a postal_code component
    for (const result of json.results) {
      const comp = result.address_components.find((c) =>
        c.types.includes('postal_code')
      );
      if (comp) return comp.long_name;
    }

    const err = new Error('Pincode not found for current location.');
    err.code = 'PINCODE_NOT_FOUND';
    throw err;
  },
};

export default locationService;
