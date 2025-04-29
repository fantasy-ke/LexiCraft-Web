import api from './index';
import type { ApiResponse } from './model/common.model';
import type { CaptchaData, CaptchaResponse } from './model/verification.model';

/**
 * 获取图形验证码
 * @returns 验证码信息，包含key和验证码图片base64
 */
export const getCaptchaCode = async (): Promise<CaptchaResponse> => {
  // 生成随机key
  const randomKey = Math.random().toString(36).substring(2, 15);
  const url = `/Verification/CaptchaCode`;
    // 使用封装的API请求
  return await api.get<CaptchaData>(url,{key:randomKey});
};

/**
 * 验证验证码
 * @param key 验证码key
 * @param code 用户输入的验证码
 * @returns 验证结果
 */
export const verifyCaptcha = async (key: string, code: string): Promise<ApiResponse<boolean>> => {
  try {
    return await api.post<boolean>('/Verification/VerifyCaptcha', {
      key,
      code
    });
  } catch (error: any) {
    console.error('验证码验证失败:', error);
    throw new Error(error.message || '验证失败，请重试');
  }
}; 