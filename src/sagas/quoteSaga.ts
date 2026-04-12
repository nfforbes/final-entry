import { call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import { submitQuoteStart, submitQuoteSuccess, submitQuoteFailure } from '@/store/slices/quoteSlice';

function* handleSubmitQuote(action: ReturnType<typeof submitQuoteStart>): Generator {
  try {
    const response = yield call(axios.post, '/api/quotes', (action as { payload: unknown }).payload);
    const data = (response as { data: { id: string } }).data;
    yield put(submitQuoteSuccess(data.id));
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { error?: string } }; message?: string })
      ?.response?.data?.error ?? 'Failed to submit quote. Please try again.';
    yield put(submitQuoteFailure(message));
  }
}

export function* quoteSaga() {
  yield takeLatest('quote/submitQuoteRequest', handleSubmitQuote);
}
