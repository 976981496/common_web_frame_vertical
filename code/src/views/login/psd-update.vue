<template>
  <div class="login-container">
    <el-form
      ref="pwdfoRm"
      :model="pwdfoRm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">{{ $t('login.psdUpdate') }}</h3>
        <lang-select class="set-language" />
      </div>

      <el-form-item prop="email">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="email"
          v-model="pwdfoRm.email"
          :placeholder="$t('login.email')"
          name="email"
          type="text"
          auto-complete="on"
        />
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="old_passwd">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            ref="passwd"
            v-model="pwdfoRm.old_passwd"
            type="password"
            :placeholder="$t('tips.oldPasswd')"
            name="password"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
        </el-form-item>
      </el-tooltip>
      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="new_passwd">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            ref="passwd"
            v-model="pwdfoRm.new_passwd"
            type="password"
            :placeholder="$t('tips.newPasswd1')"
            name="password"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
        </el-form-item>
      </el-tooltip>
      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="new_passwd1">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            ref="passwd2"
            v-model="pwdfoRm.new_passwd1"
            type="password"
            :placeholder="$t('tips.newPasswd2')"
            name="password"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
        </el-form-item>
      </el-tooltip>

      <el-button
        :loading="loading"
        type="primary"
        style="width:100%;margin-bottom:30px;"
        @click.native.prevent="handleLogin"
      >{{ $t('table.confirm') }}</el-button>
    </el-form>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import { updatePsd } from '@/api/dashboard'
import i18n from '@/lang'
import sha1 from 'js-sha1'

export default {
  components: { LangSelect },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user email'))
      } else {
        callback()
      }
      callback()
    }
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(i18n.t(`tips.newPasswd2`)))
      } else if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else if (value !== this.pwdfoRm.new_passwd) {
        callback(new Error(i18n.t(`tips.psdDiff`)))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      pwdfoRm: {
        email: '',
        old_passwd: '',
        new_passwd: '',
        new_passwd1: ''
      },
      loginRules: {
        email: [
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        old_passwd: [
          {
            required: true,
            message: i18n.t(`tips.oldPasswd`),
            trigger: 'change'
          },
          { validator: validatePassword, trigger: 'blur' }
        ],
        new_passwd: [
          {
            required: true,
            message: i18n.t(`tips.newPasswd1`),
            trigger: 'change'
          },
          { validator: validatePassword, trigger: 'blur' }
        ],
        new_passwd1: [
          {
            required: true,
            message: i18n.t(`tips.newPasswd2`),
            trigger: 'change'
          },
          { validator: validatePass, trigger: 'blur' }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.pwdfoRm.email === '') {
      this.$refs.email.focus()
    } else if (this.pwdfoRm.passwd === '') {
      this.$refs.passwd.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (
          (shiftKey && (key >= 'a' && key <= 'z')) ||
          (!shiftKey && (key >= 'A' && key <= 'Z'))
        ) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    handleLogin() {
      this.$refs.pwdfoRm.validate(valid => {
        if (valid) {
          this.loading = true
          const tempData = {
            email: this.pwdfoRm.email,
            old_passwd: sha1('orbbec_tool_integration_' + this.pwdfoRm.old_passwd),
            new_passwd: sha1('orbbec_tool_integration_' + this.pwdfoRm.new_passwd)
          }
          updatePsd(tempData)
            .then(() => {
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
              setTimeout(() => {
                this.$router.push({ path: this.redirect || '/' })
                this.loading = false
              }, 2 * 1000)
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
