import apiClient from './apiClient';
import { RateFaqRequest } from '../types/faq';
import { DirectUserFeedbacksRequest } from '../types/feedback';

export const sendQuestion = async (question: string, language: string) => {
	try {
		const response = await apiClient.post('/question', {
			question,
			language,
		});
		return response.data;
	} catch (error: any) {
		console.error('Error while sending question:', error);
		throw error.response?.data || error.message;
	}
};

export const getAllQuestions = async () => {
	try {
		const response = await apiClient.get('/all_questions');
		return response.data;
	} catch (error: any) {
		console.error('Error while fetching all questions:', error);
		throw error.response?.data || error.message;
	}
};

export const rateFAQ = async ({
	faq_id,
	rating,
	user_question,
	language,
}: RateFaqRequest) => {
	try {
		const response = await apiClient.post('/rate', {
			faq_id,
			rate: rating,
			user_question,
			language,
		});
		return response;
	} catch (error: any) {
		console.error('Error while rating FAQ:', error);
		throw error.response?.data || error.message;
	}
};

export const directUserFeedback = async ({
	feedback_detail,
	language,
}: DirectUserFeedbacksRequest) => {
	try {
		const response = await apiClient.post('/direct_user_feedback', {
			feedback_detail,
			language,
		});
		return response;
	} catch (error: any) {
		console.error('Error while direct user feedback FAQ:', error);
		throw error.response?.data || error.message;
	}
};

export const postFaqUserFeedback = async ({
	feedback_detail,
	language,
}: DirectUserFeedbacksRequest) => {
	try {
		const response = await apiClient.post('/direct_user_feedback', {
			feedback_detail,
			language,
		});
		return response;
	} catch (error: any) {
		console.error('Error while direct user feedback FAQ:', error);
		throw error.response?.data || error.message;
	}
};

export const getAllFAQs = async () => {
	try {
		const response = await apiClient.get('/all_faqs');
		return response.data;
	} catch (error: any) {
		console.error('Error while fetching top questions:', error);
		throw error.response?.data || error.message;
	}
};

export const getFAQs = async () => {
	try {
		const response = await apiClient.get('/top_faqs');
		return response.data;
	} catch (error: any) {
		console.error('Error while fetching top questions:', error);
		throw error.response?.data || error.message;
	}
};
