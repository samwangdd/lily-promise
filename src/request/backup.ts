/**
 * 基于axios的二次网络请求封装
 */
// import wxAdapter from '@medlinker/wx-request-sdk';
import axios, { AxiosInstance, Canceler, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import qs from 'qs';

export type RequestBaseConfig = {
  bodyType?: 'formData' | 'json' | 'url';
  platform?: 'h5' | 'miniapp';
} & AxiosRequestConfig;

export type RequestInstanceConfig = RequestBaseConfig;

export type SourceResponse<T> = AxiosResponse<T>;

export class Request<P = {}, D = {}, R = {}> {
  private config: RequestBaseConfig;

  private axiosInstance: AxiosInstance;

  // private hookConfig: HookConfig;

  private canceler?: Canceler;

  constructor(axiosInstance: AxiosInstance, config: RequestInstanceConfig) {
    const baseConfig = {
      // adapter: config.platform === 'miniapp' ? wxAdapter.adapter : undefined,
      ...config
    };

    this.config = baseConfig;
    // this.hookConfig = {
    //   onSuccess,
    //   onError
    // };
    this.axiosInstance = axiosInstance;
  }

  /**
   * 同Promise.then
   * @returns {this}
   */
  then<T1 = R, T2 = never>(
    onFullfilled: ((res: R) => T1 | PromiseLike<T1>) | undefined | null,
    onReject?: ((e: any) => T2 | PromiseLike<T2>) | null | undefined
  ): Promise<T1 | T2> {
    // @ts-ignore
    return this.send().then(onFullfilled, onReject);
  }

  /**
   * 同Promise.catch
   * @returns {this}
   */
  catch<T>(onReject: (e: Error) => any): Promise<T> {
    return this.send().then(null, onReject);
  }

  /**
   * 中断当前请求
   * @returns {this}
   */
  cancel(): this {
    if (this.canceler) {
      this.canceler();
    }

    return this;
  }

  /**
   * 追加url参数
   * @param params - 数据
   * @returns {this}
   */
  appendParams(params: { [k in keyof P]?: P[k] }) {
    this.config.params = {
      ...this.config.params,
      ...params
    };

    return this;
  }

  /**
   * 设置url参数数据
   * @param params - 数据
   * @returns {this}
   */
  setParams(params: P) {
    this.config.params = params;

    return this;
  }

  /**
   * 设置正文数据
   * @param data - 数据
   * @returns {this}
   */
  setData(data: D) {
    this.config.data = data;

    return this;
  }

  /**
   * 设置配置参数
   * @param config - 配置参数
   * @returns {this}
   */
  setConfig(config: RequestBaseConfig) {
    this.config = { ...this.config, ...config };

    return this;
  }

  /**
   * 设置 headers 参数
   * @param headers - headers 参数
   * @returns {this}
   */
  setHeaders(headers: RequestBaseConfig['headers']) {
    this.config.headers = { ...this.config.headers, ...headers };

    return this;
  }

  /**
   * 追加正文数据
   * @param data - 数据
   * @returns {this}
   */
  appendData(data: { [k in keyof D]?: D[k] }) {
    this.config.data = {
      ...this.config.data,
      ...data
    };

    return this;
  }

  /**
   * 发送请求
   * @returns {this}
   */
  private send() {
    this.cancel();
    const { cancel, token } = axios.CancelToken.source();

    this.config.cancelToken = token;
    this.canceler = cancel;

    if (!this.config.headers) {
      this.config.headers = {};
    }

    const config = {
      ...this.config
    };

    if (
      config.bodyType === 'formData' &&
      config.platform === 'h5' &&
      config.data instanceof window.FormData === false
    ) {
      const formData = new window.FormData();

      Object.keys(config.data).forEach(key => {
        formData.append(key, config.data[key]);
      });
      config.data = formData;
    } else if (config.bodyType === 'url') {
      config.data = qs.stringify(config.data);
    }

    delete config.bodyType;

    return this.axiosInstance(config);
  }
}

export class Instantce {
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

function createInstance(requestInstanceConfig: RequestInstanceConfig = {}) {
  const { ...axiosConfig } = requestInstanceConfig;

  return new Instantce(axios.create(axiosConfig), requestInstanceConfig);
}

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
