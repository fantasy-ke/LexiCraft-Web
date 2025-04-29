import api from './index';
import type { LoginParams, RegisterParams, UserData, UserResponse, LoginResponse } from './model/user.model';

// 用户登录
export const login = async (userAccount: string, passWord: string, captchaKey?: string, captchaCode?: string): Promise<UserData> => {
  // 创建请求数据
  const loginData: LoginParams = {
    userAccount,
    passWord
  };

  // 如果提供了验证码信息，添加到请求中
  if (captchaKey && captchaCode) {
    loginData.captchaKey = captchaKey;
    loginData.captchaCode = captchaCode;
  }

  try {
    // 调用实际API
    const response = await api.post<LoginResponse>('/authorize/Login', loginData);
    
    // 保存token和refreshToken到本地存储
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    // 获取用户信息
    const userInfo = await getUserInfo();
    
    // 返回完整的用户信息，包括token和refreshToken
    return {
      ...userInfo,
      token: response.data.token,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

// 用户注册
export const register = async (
  userAccount: string, 
  email: string, 
  password: string, 
  captchaKey?: string, 
  captchaCode?: string
): Promise<boolean> => {
  // 创建注册数据
  const registerData: RegisterParams = {
    userAccount,
    email,
    password
  };

  // 如果提供了验证码信息，添加到请求中
  if (captchaKey && captchaCode) {
    registerData.captchaKey = captchaKey;
    registerData.captchaCode = captchaCode;
  }

  try {
    // 调用实际API
    const response = await api.post<boolean>('/authorize/Register', registerData);
    return response.data
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

// GitHub登录
export const githubLogin = async (code: string): Promise<UserData> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟GitHub登录
  const userData: UserData = {
    id: 'github-123',
    username: 'github_user',
    email: 'github@example.com',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    token: 'github-token-' + Date.now()
  };
  
  return userData;
};

// Gitee登录
export const giteeLogin = async (code: string): Promise<UserData> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟Gitee登录
  const userData: UserData = {
    id: 'gitee-123',
    username: 'gitee_user',
    email: 'gitee@example.com',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    token: 'gitee-token-' + Date.now()
  };
  
  return userData;
};

// 获取用户信息
export const getUserInfo = async (): Promise<UserData> => {
  try {
    // 调用实际API获取用户信息
    const response = await api.get<UserData>('/user/UserInfo');
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

// 更新用户信息
export const updateUserInfo = async (data: Partial<UserData>): Promise<UserData> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟更新用户信息
  return {
    ...data,
    id: data.id || '1',
    username: data.username || 'demo',
    email: data.email || 'demo@example.com',
    avatar: data.avatar || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    updatedAt: new Date().toISOString()
  } as UserData;
}; 