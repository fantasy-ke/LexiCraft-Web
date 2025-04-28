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
        <a-form-item name="username">
          <a-input 
            v-model:value="registerForm.username" 
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

        <a-form-item name="agreement">
          <a-checkbox v-model:value="registerForm.agreement">
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { UserOutlined, MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons-vue';
import { register } from '@/api/user';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
});

const loading = ref(false);

const rules = {
  username: [
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
  agreement: [
    {
      validator: (rule: any, value: boolean) => {
        if (!value) {
          return Promise.reject('请阅读并同意服务条款和隐私政策');
        }
        return Promise.resolve();
      },
      trigger: 'change'
    }
  ]
};

const handleRegister = async () => {
  loading.value = true;
  try {
    const userData = await register(
      registerForm.username,
      registerForm.email,
      registerForm.password
    );
    
    userStore.setToken(userData.token);
    userStore.setUserInfo({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar
    });
    
    message.success('注册成功');
    router.push('/home');
  } catch (error: any) {
    message.error(error.message || '注册失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  // background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 40px;
  
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
      color: #1890ff;
      margin-bottom: 8px;
    }
    
    .slogan {
      font-size: 16px;
      color: #8c8c8c;
    }
  }
  
  .register-form {
    margin-top: 20px;
  }
  
  .login-link {
    text-align: center;
    margin-top: 16px;
    font-size: 14px;
    color: #8c8c8c;
    
    a {
      color: #1890ff;
    }
  }
}
</style> 