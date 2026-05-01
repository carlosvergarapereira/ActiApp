import { Platform } from 'react-native';

export const getBaseUrl = () =>
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export const buildApiUrl = (path = '') => `${getBaseUrl()}${path}`;
