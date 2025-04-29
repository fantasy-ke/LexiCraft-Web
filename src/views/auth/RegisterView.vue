<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo">
        <img src="/logo.svg" alt="LexiCraft Logo" class="logo-image" />
        <h1>LexiCraft</h1>
        <p class="slogan">创建账号，开始学习之旅</p>
      </div>

      <a-form
        :model="registerForm"
        @finish="handleRegister"
        layout="vertical"
        class="register-form"
        :rules="rules"
      >
        <a-form-item name="userAccount">
          <a-input 
            v-model:value="registerForm.userAccount" 
            placeholder="用户名" 
            size="large"
          >
            <template #prefix>
              <user-outlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="email">
          <a-input 
            v-model:value="registerForm.email" 
            placeholder="邮箱" 
            size="large"
          >
            <template #prefix>
              <mail-outlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password">
          <a-input-password 
            v-model:value="registerForm.password" 
            placeholder="设置密码" 
            size="large"
          >
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="confirmPassword">
          <a-input-password 
            v-model:value="registerForm.confirmPassword" 
            placeholder="确认密码" 
            size="large"
          >
            <template #prefix>
              <safety-outlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="captchaCode" :rules="[{ required: true, message: '请输入验证码' }]">
          <div class="captcha-container">
            <a-input 
              v-model:value="registerForm.captchaCode" 
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

        <a-form-item name="agreement" :rules="[{ required: true, message: '请阅读并同意服务条款和隐私政策' }]">
          <a-checkbox v-model:checked="registerForm.agreement">
            我已阅读并同意<a>服务条款</a>和<a>隐私政策</a>
          </a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button 
            type="primary" 
            html-type="submit" 
            size="large" 
            block 
            :loading="loading"
          >
            立即注册
          </a-button>
        </a-form-item>

        <div class="login-link">
          已有账号？<router-link to="/login">登录</router-link>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  SafetyOutlined,
  SafetyCertificateOutlined 
} from '@ant-design/icons-vue';
import { register } from '@/api/user';
import { getCaptchaCode } from '@/api/verification';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();

const registerForm = reactive({
  userAccount: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false,
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
      registerForm.captchaKey = res.data.key;
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

const rules = {
  userAccount: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { 
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
      message: '密码长度至少6位，且必须包含字母和数字'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        if (value !== registerForm.password) {
          return Promise.reject('两次输入的密码不一致');
        }
        return Promise.resolve();
      },
      trigger: 'blur'
    }
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  agreement: [
    { 
      required: true, 
      message: '请阅读并同意服务条款和隐私政策',
      transform: () => registerForm.agreement, 
      type: 'boolean',
      trigger: ['change', 'blur']
    }
  ]
};

const handleRegister = async () => {
  // 检查协议是否勾选
  if (!registerForm.agreement) {
    message.error('请阅读并同意服务条款和隐私政策');
    return;
  }

  loading.value = true;
  try {
    const success = await register(
      registerForm.userAccount,
      registerForm.email,
      registerForm.password,
      registerForm.captchaKey,
      registerForm.captchaCode
    );
    
    if (success) {
      message.success('注册成功，请登录');
      router.push('/login');
    } else {
      message.error('注册失败，请重试');
      refreshCaptcha();
    }
  } catch (error: any) {
    message.error(error.message || '注册失败，请重试');
    // 注册失败时刷新验证码
    refreshCaptcha();
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/views/RegisterView.scss';

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