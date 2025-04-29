import type { ApiResponse } from './common.model';

// 定义验证码数据类型
export interface CaptchaData {
  key: string;
  code: string; // 验证码图片的base64
}

// 使用基类泛型定义验证码响应类型
export type CaptchaResponse = ApiResponse<CaptchaData>; 