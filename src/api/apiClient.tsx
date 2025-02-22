import axios from 'axios';
import { envs } from '../envs';

const endpoint = `${envs.HOBIT_BACKEND_ENDPOINT!}/api/v0`;

const apiClient = axios.create({
	baseURL: endpoint,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

export default apiClient;
