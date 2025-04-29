import api from './index';
import type { 
  Announcement, 
  Message,
  MessageSender,
  AnnouncementsResponse,
  MessagesResponse,
  UnreadCountResponse
} from './model/message.model';
import type { ApiResponse } from './model/common.model';

// 获取系统公告
export const getAnnouncements = async (): Promise<Announcement[]> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 模拟数据
  return Array.from({ length: 5 }, (_, index) => ({
    id: `ann_${index + 1}`,
    title: `系统公告 ${index + 1}: 词库更新通知`,
    content: '我们最近更新了CET6核心词库，包含了最新的考试大纲内容，欢迎使用。',
    time: Date.now() - (index * 86400 * 1000), // 每条公告间隔一天
    read: index > 1 // 前两条未读
  }));
};

// 获取个人消息
export const getMessages = async (): Promise<Message[]> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 模拟数据
  return Array.from({ length: 3 }, (_, index) => ({
    id: `msg_${index + 1}`,
    sender: {
      id: `user_${index + 1}`,
      name: `管理员${index + 1}`,
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
    },
    content: `您的学习进度已达到${80 + index * 5}%，继续保持！`,
    time: Date.now() - (index * 43200 * 1000), // 每条消息间隔半天
    read: index > 0 // 第一条未读
  }));
};

// 标记消息为已读
export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟成功
  return true;
};

// 标记所有消息为已读
export const markAllMessagesAsRead = async (type: 'announcements' | 'messages'): Promise<boolean> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 模拟成功
  return true;
};

// 获取未读消息数量
export const getUnreadCount = async (): Promise<number> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 模拟数据
  return Math.floor(Math.random() * 5);
}; 