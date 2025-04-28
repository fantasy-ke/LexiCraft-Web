<template>
  <div class="messages-container">
    <header-component />
    
    <div class="content">
      <div class="page-header">
        <h1>消息中心</h1>
        <div class="actions">
          <a-button type="primary" @click="markAllAsRead">
            <template #icon><check-outlined /></template>
            全部已读
          </a-button>
        </div>
      </div>
      
      <a-tabs v-model="activeTab" @change="handleTabChange">
        <a-tab-pane key="announcements" tab="系统公告">
          <div class="announcements-list">
            <a-list
              :data-source="announcements"
              :loading="loadingAnnouncements"
              :pagination="paginationProps"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>
                      <div class="message-title">
                        <sound-outlined v-if="!item.read" class="unread-icon" />
                        {{ item.title }}
                      </div>
                    </template>
                    <template #description>
                      <div class="message-content">{{ item.content }}</div>
                      <div class="message-time">{{ formatTime(item.time) }}</div>
                    </template>
                  </a-list-item-meta>
                  <template #extra>
                    <a-button type="link" @click="viewAnnouncementDetail(item)">查看详情</a-button>
                  </template>
                </a-list-item>
              </template>
              <template #emptyText>
                <div class="empty-content">
                  <inbox-outlined />
                  <p>暂无系统公告</p>
                </div>
              </template>
            </a-list>
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="messages" tab="个人消息">
          <div class="messages-list">
            <a-list
              :data-source="messages"
              :loading="loadingMessages"
              :pagination="paginationProps"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar :src="item.sender.avatar" />
                    </template>
                    <template #title>
                      <div class="message-title">
                        <sound-outlined v-if="!item.read" class="unread-icon" />
                        {{ item.sender.name }}
                      </div>
                    </template>
                    <template #description>
                      <div class="message-content">{{ item.content }}</div>
                      <div class="message-time">{{ formatTime(item.time) }}</div>
                    </template>
                  </a-list-item-meta>
                  <template #extra>
                    <a-button type="link" @click="markAsRead(item)">标记已读</a-button>
                  </template>
                </a-list-item>
              </template>
              <template #emptyText>
                <div class="empty-content">
                  <inbox-outlined />
                  <p>暂无个人消息</p>
                </div>
              </template>
            </a-list>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    
    <footer-component />
    
    <!-- 公告详情弹窗 -->
    <a-modal v-model="detailModalVisible" :title="currentAnnouncement.title" @ok="closeDetailModal">
      <div class="announcement-detail">
        <div class="announcement-content">{{ currentAnnouncement.content }}</div>
        <div class="announcement-time">发布时间：{{ formatTime(currentAnnouncement.time) }}</div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { CheckOutlined, SoundOutlined, InboxOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/store/user';
import { 
  getAnnouncements, 
  getMessages, 
  markMessageAsRead, 
  markAllMessagesAsRead,
  type Announcement,
  type Message
} from '@/api/messages';
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import FooterComponent from '@/components/common/FooterComponent.vue';

const userStore = useUserStore();

// 当前激活的标签页
const activeTab = ref('announcements');

// 加载状态
const loadingAnnouncements = ref(false);
const loadingMessages = ref(false);

// 分页配置
const paginationProps = {
  pageSize: 10,
  showQuickJumper: true
};

// 公告列表
const announcements = ref<Announcement[]>([]);
// 消息列表
const messages = ref<Message[]>([]);

// 公告详情
const detailModalVisible = ref(false);
const currentAnnouncement = ref<Announcement>({
  id: '',
  title: '',
  content: '',
  time: 0,
  read: false
});

// 标签切换处理
const handleTabChange = (key: string) => {
  if (key === 'announcements') {
    fetchAnnouncements();
  } else {
    fetchMessages();
  }
};

// 获取系统公告
const fetchAnnouncements = async () => {
  loadingAnnouncements.value = true;
  try {
    announcements.value = await getAnnouncements();
  } catch (error) {
    message.error('获取系统公告失败');
  } finally {
    loadingAnnouncements.value = false;
  }
};

// 获取个人消息
const fetchMessages = async () => {
  loadingMessages.value = true;
  try {
    messages.value = await getMessages();
  } catch (error) {
    message.error('获取个人消息失败');
  } finally {
    loadingMessages.value = false;
  }
};

// 将所有消息标记为已读
const markAllAsRead = async () => {
  try {
    const type = activeTab.value === 'announcements' ? 'announcements' : 'messages';
    await markAllMessagesAsRead(type);
    
    if (activeTab.value === 'announcements') {
      announcements.value = announcements.value.map(ann => ({
        ...ann,
        read: true
      }));
      message.success('已将所有系统公告标记为已读');
    } else {
      messages.value = messages.value.map(msg => ({
        ...msg,
        read: true
      }));
      message.success('已将所有个人消息标记为已读');
    }
  } catch (error) {
    message.error('操作失败，请重试');
  }
};

// 标记单条消息为已读
const markAsRead = async (item: Message) => {
  try {
    await markMessageAsRead(item.id);
    const index = messages.value.findIndex(msg => msg.id === item.id);
    if (index !== -1) {
      messages.value[index].read = true;
      message.success('已标记为已读');
    }
  } catch (error) {
    message.error('操作失败，请重试');
  }
};

// 查看公告详情
const viewAnnouncementDetail = async (item: Announcement) => {
  currentAnnouncement.value = item;
  detailModalVisible.value = true;
  
  // 标记为已读
  if (!item.read) {
    try {
      await markMessageAsRead(item.id);
      const index = announcements.value.findIndex(ann => ann.id === item.id);
      if (index !== -1) {
        announcements.value[index].read = true;
      }
    } catch (error) {
      console.error('标记公告已读失败', error);
    }
  }
};

// 关闭详情弹窗
const closeDetailModal = () => {
  detailModalVisible.value = false;
};

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 初始化
onMounted(() => {
  fetchAnnouncements();
});
</script>

<style lang="scss" scoped>
.messages-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  .content {
    background-color: var(--card-background);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--box-shadow);
    margin-bottom: 20px;
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      h1 {
        font-size: 24px;
        margin: 0;
        color: var(--text-color);
      }
      
      .actions {
        display: flex;
        gap: 12px;
      }
    }
    
    .announcements-list,
    .messages-list {
      padding: 0 4px;
      
      .message-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 500;
        color: var(--text-color);
        
        .unread-icon {
          color: var(--error-color);
          margin-right: 8px;
          animation: pulsate 1.5s infinite;
        }
      }
      
      .message-content {
        color: var(--text-color-secondary);
        margin-top: 4px;
      }
      
      .message-time {
        color: var(--text-color-secondary);
        font-size: 12px;
        margin-top: 4px;
      }
    }
    
    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
      color: var(--text-color-secondary);
      
      .anticon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      
      p {
        font-size: 16px;
      }
    }
  }
  
  .announcement-detail {
    .announcement-content {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 16px;
      color: var(--text-color);
    }
    
    .announcement-time {
      color: var(--text-color-secondary);
      font-size: 14px;
    }
  }
}

@keyframes pulsate {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style> 