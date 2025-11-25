import { NextRequest, NextResponse } from 'next/server';
import {
  performPredictiveAnalysis,
  generateHistoricalData,
} from '@/lib/mockData';
import { ApiResponseHelper } from '@/lib';

/**
 * GET /api/data/predict?samples=50
 * Returns AI-like predictive maintenance analysis
 * Query parameter: samples (optional, defaults to 50, min: 10, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const samplesParam = searchParams.get('samples');

    // Parse and validate samples parameter
    let samples = 50; // Default value
    if (samplesParam) {
      const parsedSamples = parseInt(samplesParam, 10);
      if (isNaN(parsedSamples)) {
        return NextResponse.json(
          ApiResponseHelper.error(
            'Invalid samples parameter. Must be a number.'
          ),
          { status: 400 }
        );
      }
      if (parsedSamples < 10 || parsedSamples > 100) {
        return NextResponse.json(
          ApiResponseHelper.error(
            'Samples parameter must be between 10 and 100.'
          ),
          { status: 400 }
        );
      }
      samples = parsedSamples;
    }

    // Generate recent historical data for analysis
    const recentReadings = generateHistoricalData(samples);

    // Perform predictive analysis
    const prediction = performPredictiveAnalysis(recentReadings);

    // Add additional metadata for API response
    const responseData = {
      prediction,
      metadata: {
        analysisType: 'Predictive Maintenance',
        algorithm: 'Risk-based Pattern Analysis',
        confidenceLevel: calculateConfidenceLevel(prediction.sampleSize),
        nextAnalysisRecommended: getNextAnalysisTime(),
      },
    };

    return NextResponse.json(
      ApiResponseHelper.success(
        responseData,
        `Predictive analysis completed using ${samples} sensor readings`
      )
    );
  } catch (error) {
    console.error('Error performing predictive analysis:', error);
    return NextResponse.json(
      ApiResponseHelper.error('Failed to perform predictive analysis'),
      { status: 500 }
    );
  }
}

/**
 * Calculate confidence level based on sample size
 */
function calculateConfidenceLevel(sampleSize: number): string {
  if (sampleSize >= 50) return 'High';
  if (sampleSize >= 30) return 'Medium';
  if (sampleSize >= 10) return 'Low';
  return 'Insufficient Data';
}

/**
 * Get recommended time for next analysis
 */
function getNextAnalysisTime(): string {
  const nextAnalysis = new Date();
  nextAnalysis.setHours(nextAnalysis.getHours() + 24); // 24 hours from now
  return nextAnalysis.toISOString();
}
