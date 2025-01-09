import axios from 'axios';

const apiClient = axios.create({
	baseURL: 'http://localhost:4000/api/v0',
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

export default apiClient;
