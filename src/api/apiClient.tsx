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

export const API_ENDPOINT = endpoint;

export const getSessionId = (): string => {
	let sessionId = localStorage.getItem('hobit_session_id');
	if (!sessionId) {
		sessionId = crypto.randomUUID();
		localStorage.setItem('hobit_session_id', sessionId);
	}
	return sessionId;
};

// 모든 요청에 X-Session-ID 헤더 자동 주입
apiClient.interceptors.request.use((config) => {
	config.headers['X-Session-ID'] = getSessionId();
	return config;
});

export default apiClient;
