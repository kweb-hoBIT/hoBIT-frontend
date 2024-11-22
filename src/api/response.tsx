import apiClient from './apiClient';

export const sendQuestion = async (question: string): Promise<any> => {
  try {
    const response = await apiClient.post('/question', { question });
    return response.data;
  } catch (error: any) {
    console.error('Error sending question:', error);
    throw new Error(
      error.response?.data?.message ||
        'An error occurred while sending the question.'
    );
  }
};
