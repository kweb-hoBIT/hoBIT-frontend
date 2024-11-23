import apiClient from './apiClient';
import { RateFaqRequest } from '../types/faq';

export const sendQuestion = async (question: string) => {
  try {
    const response = await apiClient.post('/question', {
      question,
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

export const rateFAQ = async ({ faq_id, rating }: RateFaqRequest) => {
  try {
    const response = await apiClient.post('/rate', { faq_id, rate: rating });
    return response;
  } catch (error: any) {
    console.error('Error while rating FAQ:', error);
    throw error.response?.data || error.message;
  }
};
