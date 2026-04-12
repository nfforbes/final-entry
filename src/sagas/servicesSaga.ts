import { call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  fetchServices,
  fetchServicesSuccess,
  fetchServicesFailure,
} from '@/store/slices/servicesSlice';

function* handleFetchServices() {
  try {
    const response: { data: { services: unknown[] } } = yield call(
      axios.get,
      '/api/services'
    );
    yield put(fetchServicesSuccess(response.data.services as never[]));
  } catch {
    yield put(fetchServicesFailure('Failed to load services'));
  }
}

export function* watchServicesSaga() {
  yield takeLatest(fetchServices.type, handleFetchServices);
}
