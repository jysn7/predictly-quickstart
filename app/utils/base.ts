// Base utilities for the application

export const handleBaseError = (error: any) => {
  console.error('BASE API Error:', error);
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

export const isValidConfig = () => {
  return typeof window !== 'undefined' && !!(window as any).baseProvider;
};

export const getBaseAccountAddress = async () => {
  const provider = (window as any).baseProvider;
  if (!provider) {
    throw new Error('Base Account not available');
  }
  
  try {
    const accounts = await provider.request({
      method: "eth_accounts",
      params: [],
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Failed to get Base Account address:', error);
    return null;
  }
};

export const isConnectedToBase = async () => {
  const provider = (window as any).baseProvider;
  if (!provider) {
    return false;
  }
  
  try {
    const accounts = await provider.request({
      method: "eth_accounts",
      params: [],
    });
    return accounts && accounts.length > 0;
  } catch (error) {
    console.error('Failed to check Base Account connection:', error);
    return false;
  }
};