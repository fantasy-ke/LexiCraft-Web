import api from './index';

// 用户登录
export const login = async (username: string, password: string) => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟服务器验证
  if (username === 'demo' && password === 'password') {
    const userData = {
      id: '1',
      username: 'demo',
      email: 'demo@example.com',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      token: 'demo-token-' + Date.now()
    };
    
    return userData;
  }
  
  // 返回错误
  throw new Error('用户名或密码错误');
};

// 用户注册
export const register = async (username: string, email: string, password: string) => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟注册
  const userData = {
    id: Date.now().toString(),
    username,
    email,
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    token: 'user-token-' + Date.now()
  };
  
  return userData;
};

// GitHub登录
export const githubLogin = async (code: string) => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟GitHub登录
  const userData = {
    id: 'github-123',
    username: 'github_user',
    email: 'github@example.com',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    token: 'github-token-' + Date.now()
  };
  
  return userData;
};

// Gitee登录
export const giteeLogin = async (code: string) => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟Gitee登录
  const userData = {
    id: 'gitee-123',
    username: 'gitee_user',
    email: 'gitee@example.com',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    token: 'gitee-token-' + Date.now()
  };
  
  return userData;
};

// 获取用户信息
export const getUserInfo = async () => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟获取用户信息
  return {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  };
};

// 更新用户信息
export const updateUserInfo = async (data: any) => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟更新用户信息
  return {
    ...data,
    updatedAt: new Date().toISOString()
  };
}; 