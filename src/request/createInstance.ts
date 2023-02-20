import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { RequestBaseConfig, RequestInstanceConfig, Request } from "./request";

export class CreateRequestInstance {
  axiosInstance: AxiosInstance;
  requestInstanceConfig: RequestInstanceConfig;

  constructor(axiosInstance: AxiosInstance, requestInstanceConfig: RequestInstanceConfig) {
    this.axiosInstance = axiosInstance;
    this.requestInstanceConfig = requestInstanceConfig;
  }

  get = <P = {}, R = AxiosResponse<{}>>(url: string, config?: RequestBaseConfig) => {
    return new Request<P, {}, R>(this.axiosInstance, {
      method: 'get',
      url,
      ...this.requestInstanceConfig,
      ...config
    });
  };

  post = <D = {}, R = AxiosResponse<{}>>(url: string, config?: RequestBaseConfig) => {
    return new Request<{}, D, R>(this.axiosInstance, {
      method: 'post',
      url,
      ...this.requestInstanceConfig,
      ...config
    });
  };

  put = <D = {}, R = AxiosResponse<{}>>(url: string, config?: RequestBaseConfig) => {
    return new Request<{}, D, R>(this.axiosInstance, {
      method: 'put',
      url,
      ...this.requestInstanceConfig,
      ...config
    });
  };

  delete = <P = {}, R = AxiosResponse<{}>>(url: string, config?: RequestBaseConfig) => {
    return new Request<P, {}, R>(this.axiosInstance, {
      method: 'delete',
      url,
      ...this.requestInstanceConfig,
      ...config
    });
  };

  interceptor = {
    req: (func: (req: AxiosRequestConfig) => any) => {
      this.axiosInstance.interceptors.request.use(func);
    },
    res: (func: (res: AxiosResponse<any>) => any) => {
      this.axiosInstance.interceptors.response.use(func);
    },
    error: (func: (err: AxiosError<any>) => any) => {
      this.axiosInstance.interceptors.response.use(undefined, func);
    }
  };
}

function createRequest(requestInstanceConfig: RequestInstanceConfig = {}) {
  const { ...axiosConfig } = requestInstanceConfig;

  return new CreateRequestInstance(axios.create(axiosConfig), requestInstanceConfig);
}

export default createRequest;
