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
              name="userAccount"
              :rules="[{ required: true, message: '请输入用户名' }]"
            >
              <a-input 
                v-model:value="loginForm.userAccount" 
                placeholder="用户名" 
                size="large"
              >
                <template #prefix>
                  <user-outlined />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item
              name="passWord"
              :rules="[
                { required: true, message: '请输入密码' }
              ]"
            >
              <a-input-password 
                v-model:value="loginForm.passWord" 
                placeholder="密码" 
                size="large"
              >
                <template #prefix>
                  <lock-outlined />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item
              name="captchaCode"
              :rules="[{ required: true, message: '请输入验证码' }]"
            >
              <div class="captcha-container">
                <a-input 
                  v-model:value="loginForm.captchaCode" 
                  placeholder="验证码" 
                  size="large"
                >
                  <template #prefix>
                    <safety-certificate-outlined />
                  </template>
                </a-input>
                <div class="captcha-image" @click="refreshCaptcha">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                  <div v-else class="captcha-loading">
                    <a-spin />
                  </div>
                </div>
              </div>
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { 
  UserOutlined, 
  LockOutlined, 
  GithubOutlined, 
  GitlabOutlined,
  SafetyCertificateOutlined 
} from '@ant-design/icons-vue';
import { login, githubLogin, giteeLogin } from '@/api/user';
import { getCaptchaCode } from '@/api/verification';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref();

const loginForm = reactive({
  userAccount: '',
  passWord: '',
  remember: false,
  captchaKey: '',
  captchaCode: ''
});

const loading = ref(false);
const captchaImage = ref('');
const captchaLoading = ref(false);

// 获取验证码
const refreshCaptcha = async () => {
  captchaLoading.value = true;
  try {
    const res = await getCaptchaCode();
    if (res.status && res.data) {
      loginForm.captchaKey = res.data.key;
      captchaImage.value = res.data.code;
    } else {
      message.error(res.message || '获取验证码失败');
    }
  } catch (error: any) {
    message.error(error.message || '获取验证码失败');
  } finally {
    captchaLoading.value = false;
  }
};

// 页面加载时获取验证码
onMounted(() => {
  refreshCaptcha();
});

const handleLogin = async () => {
  loading.value = true;
  try {
    const userData = await login(
      loginForm.userAccount, 
      loginForm.passWord,
      loginForm.captchaKey,
      loginForm.captchaCode
    );
    
    userStore.setToken(userData.token || "", userData.refreshToken || "");
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
    // 登录失败时刷新验证码
    refreshCaptcha();
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
@use '@/styles/views/LoginView.scss';

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;

  .captcha-image {
    width: 120px;
    height: 40px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .captcha-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background-color: #f0f0f0;
    }
  }
}
</style> 