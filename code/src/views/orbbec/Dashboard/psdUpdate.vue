<template>
  <div class="app-container">
     <div class="psdupdate-container">
          <el-form
            ref="dataForm"
            :model="user"
            :rules="rules"
            label-width="80px"
            size="mini"
            label-position="top"
          >
            <el-form-item :label="$t('table.oldPasswd')" prop="old_passwd">
              <el-input
                v-model.trim="user.old_passwd"
                :placeholder="$t('tips.oldPasswd')"
                show-password
                @focus="resetTips"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('table.newPasswd')" prop="new_passwd">
              <el-input
                v-model.trim="user.new_passwd"
                :placeholder="$t('tips.newPasswd1')"
                show-password
                @focus="resetTips"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('table.newPasswdrel')" prop="new_passwd1">
              <el-input
                v-model.trim="user.new_passwd1"
                :placeholder="$t('tips.newPasswd2')"
                show-password
                @focus="resetTips"
              />
            </el-form-item>

            <el-form-item>

            <el-button
              type="primary"
              size="big"
              style="float:right;width: 362px;height: 58px;font-size: 16px"
              :loading="loadingStatus"
              @click="updatePsd"
            >{{ $t('table.confirmPsd') }}</el-button>
            </el-form-item>
          </el-form>
  </div></div>
</template>

<script>
import { mapState } from "vuex";
import checkPermission from "@/utils/permission";
import { addClass, removeClass } from "@/utils";
import { updatePsd } from "@/api/dashboard";
import i18n from "@/lang";
import sha1 from "js-sha1";

export default {
  name: "PsdUpdata",
  props: [ 'visibleDialog' ],
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(i18n.t(`tips.newPasswd2`)));
      } else if (value.length < 6) {
        callback(new Error("The password can not be less than 6 digits"));
      } else if (value !== this.user.new_passwd) {
        callback(new Error(i18n.t(`tips.psdDiff`)));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error("The password can not be less than 6 digits"));
      } else {
        callback();
      }
    };
    return {
      show: false,
      loadingStatus: false,
      tipshow: false,
      tipSucc: false,
      tipWarn: false,
      tipWarnInfo: "",
      user: {
        old_passwd: "",
        new_passwd: "",
        new_passwd1: ""
      },

      rules: {
        old_passwd: [
          {
            required: false,
            message: i18n.t(`tips.oldPasswd`),
            trigger: "change"
          },
          { validator: validatePassword, trigger: "blur" },
          { min: 1, max: 128, message: '长度在 1 到 128 个字符内' }
        ],
        new_passwd: [
          {
            required: false,
            message: i18n.t(`tips.newPasswd1`),
            trigger: "change"
          },
          { validator: validatePassword, trigger: "blur" },
          { min: 1, max: 128, message: '长度在 1 到 128 个字符内' }
        ],
        new_passwd1: [
          {
            required: false,
            message: i18n.t(`tips.newPasswd2`),
            trigger: "change"
          },
          { validator: validatePass, trigger: "blur" },
          { min: 1, max: 128, message: '长度在 1 到 128 个字符内' }
        ]
      }
    };
  },
  computed: {
    ...mapState({
      email: state => state.user.email,
    }),
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    checkPermission,
    updatePsd() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          // const tempData = Object.assign({}, this.user)
          this.loadingStatus = true;
          const tempData = {
            email: this.email,
            old_passwd: sha1("orbbec_tool_integration_" + this.user.old_passwd),
            new_passwd: sha1("orbbec_tool_integration_" + this.user.new_passwd)
          };
          updatePsd(tempData).then(
            () => {
              this.loadingStatus = false;
              this.closeDialog()
            },
            err => {
              this.loadingStatus = false
              this.tipWarnInfo = err.msg
            }
          );
        }
      });
    },
    resetTips() {
      this.tipshow = false;
      this.tipWarn = false;
      this.tipSucc = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.psdupdate-container {
  padding: 41px 51px 36px 60px;
  font-size: 14px;
  word-wrap: break-word;
    /deep/ .el-form-item {
      display: flex;
      flex-direction: row;
      align-items: center;
        margin-bottom: 24px;
       /deep/ .el-form-item__label{
        padding-right: 12px;
        width: 80px;

        }
      /deep/.el-form-item__content{
        line-height: 52px;
        height: 52px;

        /deep/ .el-input__inner{
        line-height: 52px;
        height: 52px;
        font-size: 14px;
        width: 292px;

        }
  }
    }
  }

</style>
