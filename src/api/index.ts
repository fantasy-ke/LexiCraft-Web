import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from './model/common.model';

// 获取API基础URL
const getBaseURL = () => {
  // 优先使用环境变量中的API地址
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 其次使用Vite定义的API URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 开发模式下使用相对路径，让Vite代理处理
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // 生产环境下使用默认的相对路径
  return '/api';
};

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 增加超时时间
  // 生产环境下不需要带凭证，避免CORS问题
  withCredentials: import.meta.env.DEV
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    config.headers["Content-type"] = "application/json";
    // 添加刷新token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      config.headers['X-Refresh-Token'] = refreshToken;
    }
    
    // 打印请求信息，便于调试
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 打印响应信息，便于调试
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    
    return response.data;
  },
  (error) => {
    const errorMessage = {
      message: '未知错误',
      code: 'UNKNOWN_ERROR'
    };
    
    // 详细记录网络错误信息
    if (error.message === 'Network Error') {
      console.error('[API Network Error]', {
        message: error.message,
        request: error.request,
        config: error.config
      });
      errorMessage.message = '网络连接失败，请检查网络或接口是否可用';
      errorMessage.code = 'NETWORK_ERROR';
      
      // 检查是否是HTTPS的证书问题
      if (error.config && error.config.url && error.config.url.startsWith('https://')) {
        console.error('可能是HTTPS证书问题，请确认证书是否有效或尝试使用HTTP');
      }
      
      return Promise.reject(errorMessage);
    }
    
    if (error.response) {
      const { status } = error.response;
      
      // 打印错误响应，便于调试
      console.error(`[API Error] Status: ${status}`, error.response.data);
      
      // 处理常见错误状态码
      switch (status) {
        case 400:
          errorMessage.message = '请求错误';
          errorMessage.code = 'BAD_REQUEST';
          break;
        case 401:
          errorMessage.message = '未授权，请重新登录';
          errorMessage.code = 'UNAUTHORIZED';
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage.message = '拒绝访问';
          errorMessage.code = 'FORBIDDEN';
          break;
        case 404:
          errorMessage.message = '请求地址不存在';
          errorMessage.code = 'NOT_FOUND';
          break;
        case 500:
          errorMessage.message = '服务器内部错误';
          errorMessage.code = 'SERVER_ERROR';
          break;
        default:
          errorMessage.message = `请求失败(${status})`;
          errorMessage.code = `ERROR_${status}`;
      }
      
      // 如果响应中包含错误信息，优先使用响应中的错误信息
      if (error.response.data && error.response.data.message) {
        errorMessage.message = error.response.data.message;
      }
    } else if (error.request) {
      console.error('[API Error] No response', error.request);
      errorMessage.message = '网络异常，请检查网络连接';
      errorMessage.code = 'NETWORK_ERROR';
    } else {
      console.error('[API Error] Request setup', error.message);
      errorMessage.message = error.message || '请求异常';
      errorMessage.code = 'REQUEST_ERROR';
    }
    
    // 控制台输出错误信息
    console.error(`[API Error] ${errorMessage.code}: ${errorMessage.message}`);
    
    // 你可以在这里添加全局错误提示，如使用消息提示组件
    // 例如: showErrorMessage(errorMessage.message);
    
    return Promise.reject(errorMessage);
  }
);

// 创建默认ApiResponse结构
const createDefaultResponse = <T>(data: T): ApiResponse<T> => {
  return {
    data,
    status: true,
    message: null,
    statusCode: 200
  };
};

// 封装API请求类
class Api {
  // 封装GET请求
  async get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get(url, { 
        params,
        ...config
      });
      
      // 判断响应是否已符合ApiResponse格式
      if (response && typeof response === 'object' && 'status' in response && 'data' in response) {
        // 已经是标准格式
        return response as unknown as ApiResponse<T>;
      } else {
        // 需要转换为标准格式
        return createDefaultResponse<T>(response as unknown as T);
      }
    } catch (error: any) {
      return Promise.reject(error);
    }
  }

  // 封装POST请求
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post(url, data, config);
      
      // 判断响应是否已符合ApiResponse格式
      if (response && typeof response === 'object' && 'status' in response && 'data' in response) {
        // 已经是标准格式
        return response as unknown as ApiResponse<T>;
      } else {
        // 需要转换为标准格式
        return createDefaultResponse<T>(response as unknown as T);
      }
    } catch (error: any) {
      return Promise.reject(error);
    }
  }

  // 封装PUT请求
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put(url, data, config);
      
      // 判断响应是否已符合ApiResponse格式
      if (response && typeof response === 'object' && 'status' in response && 'data' in response) {
        // 已经是标准格式
        return response as unknown as ApiResponse<T>;
      } else {
        // 需要转换为标准格式
        return createDefaultResponse<T>(response as unknown as T);
      }
    } catch (error: any) {
      return Promise.reject(error);
    }
  }

  // 封装DELETE请求
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.delete(url, config);
      
      // 判断响应是否已符合ApiResponse格式
      if (response && typeof response === 'object' && 'status' in response && 'data' in response) {
        // 已经是标准格式
        return response as unknown as ApiResponse<T>;
      } else {
        // 需要转换为标准格式
        return createDefaultResponse<T>(response as unknown as T);
      }
    } catch (error: any) {
      return Promise.reject(error);
    }
  }
}

// 创建API实例
const api = new Api();

// 导出API实例以及axios实例(用于特殊情况)
export { axiosInstance };
export default api; 