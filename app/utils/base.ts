import { getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import { baseConfig, isValidConfig } from '../config/base';

export const handleBaseError = (error: any) => {
  console.error('BASE API Error:', error);
  
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }
  
  return new Error('An unexpected error occurred');
};

export const formatPrediction = (prediction: any) => {
  return {
    id: prediction.id,
    userId: prediction.userId,
    prediction: prediction.prediction,
    confidence: prediction.confidence,
    category: prediction.category,
    expiryDate: new Date(prediction.expiryDate),
    status: prediction.status,
    outcome: prediction.outcome,
    createdAt: new Date(prediction.createdAt),
    updatedAt: new Date(prediction.updatedAt),
  };
};

export const formatUser = (user: any) => {
  return {
    id: user.id,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    stats: {
      totalPredictions: user.stats?.totalPredictions || 0,
      correctPredictions: user.stats?.correctPredictions || 0,
      accuracy: user.stats?.accuracy || 0,
    },
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
};