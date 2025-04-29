import type { ApiResponse } from './common.model';

/**
 * 用户数据类型
 */
export interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string;
  token?: string;
  refreshToken?: string;
  updatedAt?: string;
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  userAccount: string;
  passWord: string;
  captchaKey?: string;
  captchaCode?: string;
}

/**
 * 登录响应结果
 */
export interface LoginResponse {
  token: string;
  refreshToken: string;
}

/**
 * 注册请求参数
 */
export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  captchaKey?: string;
  captchaCode?: string;
}

/**
 * 用户信息响应
 */
export type UserResponse = ApiResponse<UserData>; 