import { all } from 'redux-saga/effects';
import { quoteSaga } from '@/sagas/quoteSaga';
import { watchServicesSaga } from '@/sagas/servicesSaga';

export function* rootSaga() {
  yield all([quoteSaga(), watchServicesSaga()]);
}
