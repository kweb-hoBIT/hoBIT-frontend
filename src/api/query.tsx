import apiClient from './apiClient';
import { RateFaqRequest } from '../types/faq';
import { DirectUserFeedbacksRequest } from '../types/feedback';
import { GetSeniorFaqByIdRequest } from '../types/seniorFaq';

export const sendQuestion = async (question: string, language: string) => {
  try {
    if (language == 'EN') {
      question = question.toLowerCase();
    }

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
  id,
  user_question,
  faq_id,
  rating,
  feedback_reason,
  feedback_detail,
  language,
}: RateFaqRequest) => {
  try {
    const response = await apiClient.post('/rate', {
      id,
      user_question,
      faq_id,
      rate: rating,
      feedback_reason,
      feedback_detail,
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
    console.error('Error while fetching all faqs:', error);
    throw error.response?.data || error.message;
  }
};

export const getFAQs = async () => {
  try {
    const response = await apiClient.get('/top_faqs');
    return response.data;
  } catch (error: any) {
    console.error('Error while fetching top faqs:', error);
    throw error.response?.data || error.message;
  }
};

export const getSeniorFAQById = async ({ id }: GetSeniorFaqByIdRequest) => {
  try {
    const response = await apiClient.get('/senior_faq', {
      params: {
        id,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error while fetching senior faq by id:', error);
    throw error.response?.data || error.message;
  }
};

export const getAllSeniorFAQs = async () => {
  try {
    const response = await apiClient.get('/all_senior_faqs');
    return response.data;
  } catch (error: any) {
    console.error('Error while fetching all senior faqs questions:', error);
    throw error.response?.data || error.message;
  }
};
