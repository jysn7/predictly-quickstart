import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo purposes
let predictions: any[] = [];
let nextId = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const filteredPredictions = userId 
      ? predictions.filter(p => p.userId === userId)
      : predictions;

    return NextResponse.json(filteredPredictions.slice(0, 20));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, prediction, confidence, category, expiryDate } = body;

    if (!userId || !prediction || !confidence || !category || !expiryDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newPrediction = {
      id: nextId++,
      userId,
      prediction,
      confidence,
      category,
      expiryDate: new Date(expiryDate),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    predictions.push(newPrediction);
    return NextResponse.json(newPrediction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { predictionId, status, outcome } = body;

    if (!predictionId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prediction = predictions.find(p => p.id === predictionId);
    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }

    prediction.status = status;
    if (outcome) prediction.outcome = outcome;
    prediction.updatedAt = new Date();

    return NextResponse.json(prediction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}