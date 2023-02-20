/**
 * 基于axios的二次网络请求封装
 */

// import wxAdapter from '@medlinker/wx-request-sdk';
import axios from 'axios';
import createInstance from './createInstance';

function isCancelError(err: Error) {
  return axios.isCancel(err);
}

const defaultInstance = createInstance();

export default {
  create: createInstance,
  isCancelError,
  get: defaultInstance.get,
  post: defaultInstance.post,
  put: defaultInstance.put,
  delete: defaultInstance.delete,
  defaults: defaultInstance.axiosInstance.defaults,
  interceptor: defaultInstance.interceptor
};
