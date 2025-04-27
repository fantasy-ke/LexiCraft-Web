<template>
  <div class="profile-container">
    <header-component />
    
    <div class="content">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-card class="profile-card">
            <div class="profile-header">
              <a-upload
                class="avatar-uploader"
                :show-upload-list="false"
                action="/api/upload"
                :before-upload="beforeUpload"
                @change="handleAvatarChange"
              >
                <div class="avatar-wrapper">
                  <a-avatar :size="120" :src="userInfo.avatar" />
                  <div class="avatar-mask">
                    <camera-outlined />
                    <p>更换头像</p>
                  </div>
                </div>
              </a-upload>
              <h2 class="username">{{ userInfo.username }}</h2>
              <p class="email">{{ userInfo.email }}</p>
            </div>
            
            <a-divider />
            
            <div class="profile-stats">
              <div class="stat-item">
                <p class="stat-value">{{ typingProgress.masteredWords }}</p>
                <p class="stat-label">掌握单词（拼写）</p>
              </div>
              <div class="stat-item">
                <p class="stat-value">{{ connectProgress.masteredWords }}</p>
                <p class="stat-label">掌握单词（连连看）</p>
              </div>
              <div class="stat-item">
                <p class="stat-value">{{ formatTime(totalStudyTime) }}</p>
                <p class="stat-label">学习时长</p>
              </div>
            </div>
            
            <a-divider />
            
            <div class="profile-actions">
              <a-button block @click="handleLogout">
                <template #icon><logout-outlined /></template>
                退出登录
              </a-button>
            </div>
          </a-card>
        </a-col>
        
        <a-col :span="16">
          <a-tabs default-active-key="1">
            <a-tab-pane key="1" tab="个人信息">
              <a-card class="info-card">
                <a-form
                  :model="formState"
                  @finish="handleUpdate"
                  layout="vertical"
                >
                  <a-form-item label="用户名" name="username">
                    <a-input v-model="formState.username" />
                  </a-form-item>
                  
                  <a-form-item label="邮箱" name="email">
                    <a-input v-model="formState.email" />
                  </a-form-item>
                  
                  <a-form-item label="自我介绍" name="bio">
                    <a-textarea v-model="formState.bio" :rows="4" />
                  </a-form-item>
                  
                  <a-form-item>
                    <a-button type="primary" html-type="submit" :loading="loading">
                      保存修改
                    </a-button>
                  </a-form-item>
                </a-form>
              </a-card>
            </a-tab-pane>
            
            <a-tab-pane key="2" tab="学习记录">
              <a-card class="record-card">
                <a-row :gutter="16" class="record-summary">
                  <a-col :span="8">
                    <a-statistic
                      title="学习天数"
                      :value="studyDays"
                      style="text-align: center"
                    >
                      <template #suffix>天</template>
                    </a-statistic>
                  </a-col>
                  <a-col :span="8">
                    <a-statistic
                      title="学习单词总数"
                      :value="typingProgress.masteredWords + connectProgress.masteredWords"
                      style="text-align: center"
                    />
                  </a-col>
                  <a-col :span="8">
                    <a-statistic
                      title="平均正确率"
                      :value="averageAccuracy"
                      style="text-align: center"
                    >
                      <template #suffix>%</template>
                    </a-statistic>
                  </a-col>
                </a-row>
                
                <a-divider />
                
                <h3>学习进度</h3>
                <a-progress
                  :percent="(typingProgress.masteredWords / typingProgress.totalWords) * 100"
                  status="active"
                  :format="() => `拼写模式: ${typingProgress.masteredWords}/${typingProgress.totalWords}`"
                  style="margin-bottom: 16px"
                />
                <a-progress
                  :percent="(connectProgress.masteredWords / connectProgress.totalWords) * 100"
                  status="active"
                  :format="() => `连连看模式: ${connectProgress.masteredWords}/${connectProgress.totalWords}`"
                />
              </a-card>
            </a-tab-pane>
            
            <a-tab-pane key="3" tab="自定义词库">
              <a-card class="wordlist-card">
                <div class="upload-section">
                  <a-upload
                    :file-list="fileList"
                    :before-upload="beforeWordlistUpload"
                    @change="handleWordlistChange"
                  >
                    <a-button type="primary">
                      <template #icon><upload-outlined /></template>
                      上传词库文件
                    </a-button>
                    <a-typography-text type="secondary" style="margin-left: 8px">
                      支持 JSON 格式，请参考<a>词库格式说明</a>
                    </a-typography-text>
                  </a-upload>
                </div>
                
                <a-divider />
                
                <h3>我的词库</h3>
                <a-list
                  :data-source="wordLists"
                  :loading="listLoading"
                >
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <a-list-item-meta
                        :title="item.name"
                        :description="item.description"
                      >
                        <template #avatar>
                          <a-avatar>{{ item.name.charAt(0) }}</a-avatar>
                        </template>
                      </a-list-item-meta>
                      <template #actions>
                        <a-tag color="blue">{{ item.count }} 个单词</a-tag>
                        <a key="select" @click="selectWordList(item)">选择使用</a>
                      </template>
                    </a-list-item>
                  </template>
                </a-list>
              </a-card>
            </a-tab-pane>
            
            <a-tab-pane key="4" tab="分享与社交">
              <a-card class="share-card">
                <div class="share-options">
                  <h3>分享你的学习成果</h3>
                  <p>通过社交媒体分享你的学习进度和成就</p>
                  <div class="social-buttons">
                    <a-button type="primary" shape="circle" @click="shareToWeibo">
                      <template #icon><weibo-outlined /></template>
                    </a-button>
                    <a-button type="primary" shape="circle" @click="shareToWeChat">
                      <template #icon><wechat-outlined /></template>
                    </a-button>
                    <a-button type="primary" shape="circle" @click="shareToQQ">
                      <template #icon><qq-outlined /></template>
                    </a-button>
                  </div>
                </div>
                
                <a-divider />
                
                <div class="invite-section">
                  <h3>邀请好友</h3>
                  <a-input-group compact>
                    <a-input
                      style="width: calc(100% - 120px)"
                      disabled
                      :value="inviteLink"
                    />
                    <a-button type="primary" @click="copyInviteLink">复制链接</a-button>
                  </a-input-group>
                </div>
              </a-card>
            </a-tab-pane>
          </a-tabs>
        </a-col>
      </a-row>
    </div>
    
    <footer-component />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { 
  CameraOutlined, 
  LogoutOutlined, 
  UploadOutlined, 
  WeiboOutlined, 
  WechatOutlined,
  QqOutlined
} from '@ant-design/icons-vue';
import { useUserStore } from '@/store/user';
import { useWordStudyStore, type WordList } from '@/store/wordStudy';
import { updateUserInfo } from '@/api/user';
import { fetchWordLists, uploadWordList } from '@/api/wordlist';
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import FooterComponent from '@/components/common/FooterComponent.vue';

const router = useRouter();
const userStore = useUserStore();
const wordStudyStore = useWordStudyStore();

// 用户信息
const userInfo = computed(() => userStore.getUserInfo);

// 学习进度
const typingProgress = computed(() => wordStudyStore.getSpellingProgress);
const connectProgress = computed(() => wordStudyStore.getConnectProgress);

// 总学习时间
const totalStudyTime = computed(() => typingProgress.value.studyTime + connectProgress.value.studyTime);

// 随机生成学习天数（模拟数据）
const studyDays = ref(Math.floor(Math.random() * 30) + 1);

// 平均正确率
const averageAccuracy = computed(() => {
  const typingAcc = typingProgress.value.accuracy || 0;
  const connectAcc = connectProgress.value.accuracy || 0;
  
  if (typingAcc === 0 && connectAcc === 0) {
    return 0;
  } else if (typingAcc === 0) {
    return connectAcc;
  } else if (connectAcc === 0) {
    return typingAcc;
  }
  
  return Math.round((typingAcc + connectAcc) / 2);
});

// 表单状态
const formState = reactive({
  username: userInfo.value.username || '',
  email: userInfo.value.email || '',
  bio: userInfo.value.bio || ''
});

// 加载状态
const loading = ref(false);
const listLoading = ref(false);

// 词库列表
const wordLists = computed(() => wordStudyStore.getWordLists);

// 文件上传相关
const fileList = ref([]);

// 邀请链接
const inviteLink = ref('https://lexicraft.example.com/invite/user123');

// 格式化时间
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
};

// 处理头像上传前的验证
const beforeUpload = (file: any) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片必须小于2MB!');
  }
  
  return isImage && isLt2M;
};

// 处理头像上传变化
const handleAvatarChange = (info: any) => {
  if (info.file.status === 'uploading') {
    loading.value = true;
    return;
  }
  
  if (info.file.status === 'done') {
    loading.value = false;
    // 模拟更新用户头像
    userStore.setUserInfo({
      ...userInfo.value,
      avatar: URL.createObjectURL(info.file.originFileObj)
    });
    message.success('头像上传成功');
  } else if (info.file.status === 'error') {
    loading.value = false;
    message.error('头像上传失败');
  }
};

// 处理个人信息更新
const handleUpdate = async () => {
  loading.value = true;
  
  try {
    // 调用API更新用户信息
    const updatedInfo = await updateUserInfo({
      username: formState.username,
      email: formState.email,
      bio: formState.bio
    });
    
    // 更新store中的用户信息
    userStore.setUserInfo({
      ...userInfo.value,
      ...updatedInfo
    });
    
    message.success('个人信息更新成功');
  } catch (error) {
    message.error('更新失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 处理词库上传前的验证
const beforeWordlistUpload = (file: any) => {
  const isJSON = file.type === 'application/json' || file.name.endsWith('.json');
  if (!isJSON) {
    message.error('只能上传JSON文件!');
  }
  return isJSON;
};

// 处理词库文件上传变化
const handleWordlistChange = async (info: any) => {
  if (info.file.status === 'uploading') {
    loading.value = true;
    return;
  }
  
  if (info.file.status === 'done') {
    loading.value = false;
    
    try {
      // 读取文件内容并解析
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          
          // 上传词库
          const wordList = await uploadWordList(content);
          
          // 更新词库列表
          const currentLists = [...wordLists.value];
          currentLists.push(wordList);
          wordStudyStore.updateWordList(currentLists);
          
          message.success('词库上传成功');
        } catch (error) {
          message.error('词库格式错误，请检查文件内容');
        }
      };
      reader.readAsText(info.file.originFileObj);
    } catch (error) {
      message.error('词库处理失败，请重试');
    }
  } else if (info.file.status === 'error') {
    loading.value = false;
    message.error('上传失败');
  }
};

// 选择词库
const selectWordList = (wordList: WordList) => {
  wordStudyStore.setCurrentWordList(wordList);
  message.success(`已选择词库: ${wordList.name}`);
};

// 分享到微博
const shareToWeibo = () => {
  message.info('微博分享功能尚未实现');
};

// 分享到微信
const shareToWeChat = () => {
  message.info('微信分享功能尚未实现');
};

// 分享到QQ
const shareToQQ = () => {
  message.info('QQ分享功能尚未实现');
};

// 复制邀请链接
const copyInviteLink = () => {
  navigator.clipboard.writeText(inviteLink.value)
    .then(() => {
      message.success('邀请链接已复制');
    })
    .catch(() => {
      message.error('复制失败，请手动复制');
    });
};

// 退出登录
const handleLogout = () => {
  userStore.logout();
  router.push('/login');
  message.success('您已成功退出登录');
};

// 初始化数据
const initData = async () => {
  listLoading.value = true;
  
  try {
    // 获取词库列表（如果还没有加载过）
    if (wordLists.value.length === 0) {
      const lists = await fetchWordLists();
      wordStudyStore.updateWordList(lists);
    }
  } catch (error) {
    message.error('获取词库数据失败');
  } finally {
    listLoading.value = false;
  }
};

onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  .content {
    margin-bottom: 20px;
    
    .profile-card {
      border-radius: 12px;
      overflow: hidden;
      height: 100%;
      
      .profile-header {
        text-align: center;
        padding: 16px 0;
        
        .avatar-uploader {
          margin-bottom: 16px;
          
          .avatar-wrapper {
            position: relative;
            display: inline-block;
            cursor: pointer;
            
            .avatar-mask {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              color: white;
              opacity: 0;
              transition: opacity 0.3s;
              
              p {
                margin-top: 8px;
                font-size: 12px;
              }
              
              &:hover {
                opacity: 1;
              }
            }
          }
        }
        
        .username {
          font-size: 20px;
          font-weight: bold;
          margin: 8px 0 4px;
        }
        
        .email {
          color: #8c8c8c;
          margin: 0;
        }
      }
      
      .profile-stats {
        display: flex;
        justify-content: space-around;
        padding: 16px 0;
        
        .stat-item {
          text-align: center;
          
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1890ff;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 12px;
            color: #8c8c8c;
            margin: 0;
          }
        }
      }
      
      .profile-actions {
        padding: 0 16px 16px;
      }
    }
    
    .info-card,
    .record-card,
    .wordlist-card,
    .share-card {
      border-radius: 12px;
      min-height: 400px;
      
      h3 {
        margin-bottom: 16px;
      }
    }
    
    .record-summary {
      margin-bottom: 16px;
    }
    
    .upload-section {
      margin-bottom: 24px;
    }
    
    .social-buttons {
      display: flex;
      gap: 16px;
      margin: 16px 0;
    }
    
    .invite-section {
      margin-top: 24px;
    }
  }
}
</style> 