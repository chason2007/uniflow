import axios from 'axios';
import { Platform } from 'react-native';

// REPLACE WITH YOUR COMPUTER'S IP ADDRESS (e.g., 192.168.1.50)
const SERVER_IP = '172.16.143.158';

const API_URL = Platform.OS === 'android' && !Platform.isTV ? 'http://10.0.2.2:5000/api' : `http://${SERVER_IP}:5000/api`;

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // 30 seconds
});

export default client;
