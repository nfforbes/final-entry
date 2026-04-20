import { call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import { submitQuoteStart, submitQuoteSuccess, submitQuoteFailure } from '@/store/slices/quoteSlice';

function* handleSubmitQuote(action: ReturnType<typeof submitQuoteStart>): Generator {
  try {
    const payload = (action as { payload: any }).payload;
    
    // Map frontend fields to backend expected fields with value translation
    const parishMap: Record<string, string> = {
      'Kingston': 'Kingston',
      'St. Andrew': 'Saint Andrew',
      'St. Thomas': 'Saint Thomas',
      'Portland': 'Portland',
      'St. Mary': 'Saint Mary',
      'St. Ann': 'Saint Ann',
      'Trelawny': 'Trelawny',
      'St. James': 'Saint James',
      'Hanover': 'Hanover',
      'Westmoreland': 'Westmoreland',
      'St. Elizabeth': 'Saint Elizabeth',
      'Manchester': 'Manchester',
      'Clarendon': 'Clarendon',
      'St. Catherine': 'Saint Catherine',
    };

    const urgencyMap: Record<string, string> = {
      'emergency': 'emergency',
      'urgent': 'high',
      'scheduled': 'medium',
      'quote-only': 'low',
    };

    const mappedPayload = {
      serviceId: payload.service,
      parish: parishMap[payload.parish] || payload.parish,
      address: payload.address || payload.community || 'N/A', // Fallback to community if specific address is missing
      pestDescription: payload.notes || 'No description provided',
      urgency: urgencyMap[payload.urgency] || 'medium',
      contactName: payload.name,
      contactEmail: payload.email,
      contactPhone: payload.phone,
      propertyType: payload.propertyType,
      propertySize: payload.propertySize,
    };

    const response = yield call(axios.post, '/api/jobs', mappedPayload);
    const data = (response as { data: { id: string } }).data;
    yield put(submitQuoteSuccess(data.id));
  } catch (err: unknown) {
    console.error('Submission Error:', err);
    const message = (err as { response?: { data?: { error?: string } }; message?: string })
      ?.response?.data?.error ?? 'Failed to submit quote. Please try again.';
    yield put(submitQuoteFailure(message));
  }
}

export function* quoteSaga() {
  yield takeLatest('quote/submitQuoteRequest', handleSubmitQuote);
}
