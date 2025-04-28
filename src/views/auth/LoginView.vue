<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <img src="/logo.svg" alt="LexiCraft Logo" class="logo-image" />
        <h1>LexiCraft</h1>
        <p class="slogan">高效学习，成就词汇力量</p>
      </div>

      <a-tabs default-active-key="account">
        <a-tab-pane key="account" tab="账号密码登录">
          <a-form
            :model="loginForm"
            @finish="handleLogin"
            layout="vertical"
            class="login-form"
            ref="formRef"
          >
            <a-form-item
              name="username"
              :rules="[{ required: true, message: '请输入用户名' }]"
            >
              <a-input 
                v-model:value="loginForm.username" 
                placeholder="用户名" 
                size="large"
              >
                <template #prefix>
                  <user-outlined />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item
              name="password"
              :rules="[
                { required: true, message: '请输入密码' }
              ]"
            >
              <a-input-password 
                v-model:value="loginForm.password" 
                placeholder="密码" 
                size="large"
              >
                <template #prefix>
                  <lock-outlined />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item>
              <div class="login-options">
                <a-checkbox v-model:checked="loginForm.remember">记住我</a-checkbox>
                <a class="forgot-link">忘记密码？</a>
              </div>
            </a-form-item>

            <a-form-item>
              <a-button 
                type="primary" 
                html-type="submit" 
                size="large" 
                block 
                :loading="loading"
              >
                登录
              </a-button>
            </a-form-item>

            <div class="register-link">
              还没有账号？<router-link to="/register">立即注册</router-link>
            </div>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="social" tab="第三方登录">
          <div class="social-login">
            <a-button 
              type="primary" 
              @click="handleGithubLogin" 
              size="large" 
              block 
              class="github-btn"
            >
              <template #icon><github-outlined /></template>
              GitHub 登录
            </a-button>

            <a-button 
              type="primary" 
              @click="handleGiteeLogin" 
              size="large" 
              block 
              class="gitee-btn"
            >
              <template #icon><gitlab-outlined /></template>
              Gitee 登录
            </a-button>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { UserOutlined, LockOutlined, GithubOutlined, GitlabOutlined } from '@ant-design/icons-vue';
import { login, githubLogin, giteeLogin } from '@/api/user';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref();

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    const userData = await login(loginForm.username, loginForm.password);
    userStore.setToken(userData.token);
    userStore.setUserInfo({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar
    });
    
    message.success('登录成功');
    router.push('/home');
  } catch (error: any) {
    message.error(error.message || '登录失败，请重试');
  } finally {
    loading.value = false;
  }
};

const handleGithubLogin = () => {
  message.info('GitHub 登录功能尚未实现，请使用账号密码登录');
  // 实际项目中应该跳转到 GitHub 授权页面
  // window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
};

const handleGiteeLogin = () => {
  message.info('Gitee 登录功能尚未实现，请使用账号密码登录');
  // 实际项目中应该跳转到 Gitee 授权页面
  // window.location.href = `https://gitee.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--background-color);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background-color: var(--card-background);
  border-radius: 16px;
  box-shadow: var(--box-shadow);
  padding: 40px;
  
  :deep(.ant-input),
  :deep(.ant-input-password) {
    background-color: var(--input-background);
    border-color: var(--input-border);
    color: var(--text-color);
    
    &::placeholder {
      color: var(--text-color-placeholder);
    }
    
    .ant-input-password-icon {
      color: var(--text-color-secondary);
    }
  }
  
  :deep(.ant-input-affix-wrapper) {
    background-color: var(--input-background);
    border-color: var(--input-border);
    
    .ant-input-prefix {
      color: var(--text-color-secondary);
    }
  }
  
  :deep(.ant-checkbox-wrapper) {
    color: var(--text-color);
    
    .ant-checkbox {
      .ant-checkbox-inner {
        background-color: var(--input-background);
        border-color: var(--input-border);
      }
      
      &.ant-checkbox-checked {
        .ant-checkbox-inner {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }
      }
    }
  }
  
  :deep(.ant-tabs) {
    .ant-tabs-tab {
      color: var(--text-color-secondary);
      
      &.ant-tabs-tab-active {
        .ant-tabs-tab-btn {
          color: var(--primary-color);
        }
      }
    }
    
    .ant-tabs-ink-bar {
      background-color: var(--primary-color);
    }
  }
  
  .logo {
    text-align: center;
    margin-bottom: 32px;
    
    .logo-image {
      width: 80px;
      height: 80px;
      margin-bottom: 16px;
    }
    
    h1 {
      font-size: 28px;
      font-weight: bold;
      color: var(--primary-color);
      margin-bottom: 8px;
    }
    
    .slogan {
      font-size: 16px;
      color: var(--text-color-secondary);
    }
  }
  
  .login-form {
    margin-top: 20px;
  }
  
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .forgot-link {
      color: var(--primary-color);
      cursor: pointer;
    }
  }
  
  .register-link {
    text-align: center;
    margin-top: 16px;
    font-size: 14px;
    color: var(--text-color-secondary);
    
    a {
      color: var(--primary-color);
    }
  }
  
  .social-login {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .github-btn {
      background-color: #24292e;
      border-color: #24292e;
    }
    
    .gitee-btn {
      background-color: #c71d23;
      border-color: #c71d23;
    }
  }
}
</style> 