import type { ApiResponse } from './common.model';

/**
 * 系统公告
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  time: number;
  read: boolean;
}

/**
 * 消息发送者
 */
export interface MessageSender {
  id: string;
  name: string;
  avatar: string;
}

/**
 * 个人消息
 */
export interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  time: number;
  read: boolean;
}

/**
 * 公告列表响应
 */
export type AnnouncementsResponse = ApiResponse<Announcement[]>;

/**
 * 消息列表响应
 */
export type MessagesResponse = ApiResponse<Message[]>;

/**
 * 未读消息数量响应
 */
export type UnreadCountResponse = ApiResponse<number>; 