<template>
  <div class="app-container">
    <Table
      ref="tabele"
      :tableData="list"
      :Option="tableOption"
      :labelData="labelData"
      @handleButton="handleButton"
    >
      <el-button slot="top" type="primary" @click="handleCreate()">{{ $t('table.add') }}</el-button>
    </Table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="89px"
        style="width: 460px; margin-left:21px;"
      >
        <el-form-item
          v-for="(label,index) in labelData"
          :key="index"
          :label="label.name"
          :prop="label.value"
        >
          <template v-if="label.type=='string'">
            <el-input v-model.trim="temp[`${label.value}`]" :placeholder="label.placeholder" />
          </template>
          <template v-if="label.type=='radio'">
            <el-radio-group v-model="temp[`${label.value}`]">
              <el-radio
                v-for="(child,index) in label.childrens"
                :key="index"
                :label="child.value"
              >{{child.name}}</el-radio>
            </el-radio-group>
          </template>
          <template v-if="label.type=='datetime'">
            <el-date-picker type="dates" v-model="temp[`${label.value}`]" placeholder="选择一个或多个日期"></el-date-picker>
          </template>
          <template v-if="label.type=='select'">
            <el-select v-model="temp[`${label.value}`]" :placeholder="label.placeholder">
              <el-option
                v-for="(child,index) in label.childrens"
                :key="index"
                :label="child.name"
                :value="child.role_id||child.group_id"
              ></el-option>
            </el-select>
          </template>

          <template v-if="label.type=='selectgroup'">
            <el-select v-model="temp[`${label.value}`]" :placeholder="label.placeholder">
              <el-option
                v-for="(child,index) in label.childrens"
                :key="index"
                :label="child.name"
                :value="child.group_id"
              ></el-option>
            </el-select>
          </template>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'? createData() : updateData()"
        >{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  fetchList,
  createUser,
  editUser,
  deleteUser,
  roleList,
  groupList
} from "@/api/systemMag";
import checkPermission from "@/utils/permission"; // 鏉冮檺鍒ゆ柇鍑芥暟
import { parseTime } from "@/utils";
import i18n from "@/lang";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

export default {
  name: "Licenses",
  components: { Pagination, Table },
  data() {
    return {
      list: [
        {
          license: "E22423ejsdf",
          edition: "v1.0",
          is_never_expire: "是",
          expire_time: "2018.10.29",
          limit_use_number: 0,
          user_email: "admin@orbbec.com",
          is_send_notice_email: true
        }
      ],
      temp: {
        license: "",
        is_never_expire: false,
        expire_time: "",
        limit_use_number: 0,
        user_email: "",
        is_send_notice_email: true
      },
      dialogFormVisible: false,
      dialogStatus: "",
      isShowExpireTime: true,
      textMap: {
        update: "Edit",
        create: "Create"
      },
      labelData: [
        {
          name: this.$t('device.device_License'),
          type: "string",
          value: "license"
        },
        {
          name: this.$t('device.device_SDK'),
          type: "string",
          value: "edition"
        },
        {
          name: "是否过期",
          type: "string",
          value: "is_never_expire"
        },
        {
          name: "过期时间",
          type: "datetime",
          value: "expire_time"
        },
        {
          name: "限制数",
          type: "string",
          value: "limit_use_number"
        },
        {
          name: "邮箱",
          type: "select",
          value: "user_email"
        }
      ],
      tableOption: {
        name: this.$t("table.actions"),
        type: "string",
        value: "actions",
        options: [
          {
            label: this.$t("table.edit"),
            type: "text",
            size: "medium",
            auth: this.update,
            methods: "editRechange"
          },
          {
            label: this.$t("table.delete"),
            type: "text",
            size: "medium",
            auth: false,
            textcolor: "textcolor",
            methods: "delectRechange"
          }
        ]
      },
       listQuery: {
        page: 0,
        page_num: 20
      },
      rules: {
        license: [
          { required: true, message: "License is required", trigger: "change" }
        ],
        edition: [
          { required: true, message: "Edition is required", trigger: "change" }
        ],
        expire_time: [
          {
            required: true,
            message: "ExpiredTime is required",
            trigger: "change"
          }
        ],
        limit_use_number: [
          { required: true, message: "Numbers is required", trigger: "change" }
        ],
        user_email: [
          {
            required: true,
            message: "UserEmail is required",
            trigger: "change"
          }
        ],
        is_never_expire: [
          {
            required: true,
            message: "Expire Type is required",
            trigger: "change"
          }
        ]
      }
    };
  },

  computed: {
    ...mapGetters(["role", "roles"])
  },
  watch: {
    "temp.expire_time": {
      handler(newName, oldName) {
        this.temp.expire_time = newName;
        console.log("expire_time==newName=" + newName);
        console.log("expire_time==oldName=" + oldName);
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.getList();
    this.getCustomersList();
    console.log(this.roles);
  },
  methods: {
    checkPermission,
    parseTime,
    handleButton(val) {
      if (val.method === "editRechange") {
        this.handleUpdate(val.row);
      } else {
        this.handleDelete(val.row);
      }
    },
    getCustomersList() {
      if (this.checkPermission(["admin", "super admin"])) {
        customersList().then(response => {
          this.optionsCust = response.customers;
        });
      }
    },
    getList() {
      this.listLoading = true;
      if (this.total < (this.listQuery.page - 1) * this.listQuery.page_num) {
        this.listQuery.page = 1;
      }
      fetchList(this.listQuery).then(response => {
        this.list = response.licenses.map(item => {
          if (item.is_never_expire) {
            item.expire_time = i18n.t(`table.ExpiredType`);
          }
          return item;
        });
        this.total = response.total_num;
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "Modified success",
        type: "success"
      });
      row.status = status;
    },
    resetTemp() {
      this.temp = {
        license: "",
        expire_time: "",
        edition: "",
        is_never_expire: false,
        limit_use_number: 0,
        user_email: "",
        is_send_notice_email: true
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.loadingStatus = true;
          const tempData = Object.assign({}, this.temp);
          // tempData.expire_time = new Date(tempData.expire_time)
          // tempData.expire_time = tempData.expire_time.toLocaleDateString().replace(/\//g, "-") + " " + tempData.expire_time.toTimeString().substr(0, 8)

          tempData.expire_time = new Date(tempData.expire_time);
          var a = [
            tempData.expire_time.getFullYear(),
            tempData.expire_time.getMonth() + 1,
            tempData.expire_time.getDate(),
            tempData.expire_time.getHours(),
            tempData.expire_time.getMinutes(),
            tempData.expire_time.getSeconds()
          ];
          for (var i = 0, len = a.length; i < len; i++) {
            if (a[i] < 10) {
              a[i] = "0" + a[i];
            }
          }
          tempData.expire_time =
            a[0] +
            "-" +
            a[1] +
            "-" +
            a[2] +
            " " +
            a[3] +
            ":" +
            a[4] +
            ":" +
            a[5];
          if (tempData.is_never_expire) {
            delete tempData.expire_time;
          }
          createLicense(tempData)
            .then(() => {
              this.loadingStatus = false;
              this.dialogFormVisible = false;
              this.getList();
              this.$notify({
                title: "Success",
                message: "Create Success",
                type: "success",
                duration: 2000
              });
            })
            .catch(() => {
              this.loadingStatus = false;
            });
        }
      });
    },
    handleUpdate(row) {
      row.is_send_notice_email = true;
      this.temp = Object.assign({}, row);
      if (row.is_never_expire) {
        this.temp.expire_time = "";
      }
      this.temp.is_send_notice_email = true;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      console.log(this.temp);
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          // const tempData = Object.assign({}, this.temp)
          const tempData = {
            license_id: this.temp.license_id,
            edition: this.temp.edition,
            is_forbidden: this.temp.is_forbidden,
            limit_use_number: this.temp.limit_use_number,
            is_never_expire: this.temp.is_never_expire,
            expire_time: this.temp.expire_time,
            is_send_notice_email: this.temp.is_send_notice_email
          };
          tempData.expire_time = new Date(tempData.expire_time);
          var a = [
            tempData.expire_time.getFullYear(),
            tempData.expire_time.getMonth() + 1,
            tempData.expire_time.getDate(),
            tempData.expire_time.getHours(),
            tempData.expire_time.getMinutes(),
            tempData.expire_time.getSeconds()
          ];
          for (var i = 0, len = a.length; i < len; i++) {
            if (a[i] < 10) {
              a[i] = "0" + a[i];
            }
          }
          tempData.expire_time =
            a[0] +
            "-" +
            a[1] +
            "-" +
            a[2] +
            " " +
            a[3] +
            ":" +
            a[4] +
            ":" +
            a[5];
          this.temp.expire_time = tempData.expire_time;

          if (this.temp.is_never_expire) {
            tempData.expire_time = i18n.t(`table.ExpiredType`);
            this.temp.expire_time = i18n.t(`table.ExpiredType`);
          }
          this.loadingStatus = true;
          editLicense(tempData).then(() => {
            this.loadingStatus = false;
            for (const v of this.list) {
              if (v.license_id === this.temp.license_id) {
                const index = this.list.indexOf(v);
                this.list.splice(index, 1, this.temp);
                break;
              }
            }
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Update success",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    changeForbidden(index, state, license_id) {
      const forbiddenObj = {
        license_id: license_id,
        is_forbidden: state === "true"
      };
      editLicense(forbiddenObj)
        .then(() => {})
        .catch(err => {
          this.list[index]["is_forbidden"] = !(state === "true");
          console.log(err);
        });
    },
    handleDelete(row) {
      this.$notify({
        title: "Success",
        message: "Delete succed!",
        type: "success",
        duration: 2000
      });
      const index = this.list.indexOf(row);
      this.list.splice(index, 1);
    }
  }
};
</script>
<style lang="scss">
.el-table tr > td:first-child span {
  text-overflow: ellipsis;
  white-space: nowrap;
}
.app-container {
  /deep/ .el-tabs--left.el-tabs--card .el-tabs__item.is-left {
    text-align: center;
  }
  /deep/ .el-tabs--left .el-tabs__header.is-left {
    margin-top: 26px;
  }
  /deep/ .el-tabs__item {
    font-size: 14px;
  }
  /deep/ .table-container {
    padding-bottom: 60px;
    background-color: #fff;
    // margin-top: -30px;
  }
  /deep/ .el-dialog {
    width: 540px;
    padding-bottom: 11px;
    /deep/ .el-dialog__header {
      height: 77px;
      line-height: 77px;
      padding: 0 40px;
      font-size: 18px;
      font-family: MicrosoftYaHei;
      font-weight: bold;
      color: #2b2b2b;
      border-bottom: 1px solid #e5e5e5;
      /deep/ .el-dialog__headerbtn {
        position: absolute;
        top: 27px;
        right: 46px;
        padding: 0;
        background: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        font-size: 16px;
      }
    }
    /deep/ .el-dialog__body {
      padding-bottom: 0px;
    }
    /deep/ .el-range-editor--medium .el-range-separator {
      line-height: 43px;
      font-size: 13px;
      width: 50px;
    }
    /deep/ .el-radio-group {
      margin-top: 10px;
      font-family: MicrosoftYaHei;
      .el-radio__inner {
        width: 18px;
        height: 18px;
      }
      .el-radio__label {
        color: #000;
      }
      .is-checked .el-radio__inner {
        background-color: rgb(48, 47, 47);
        border-color: rgb(48, 47, 47);
      }

      .el-radio {
        margin-right: 57px;
      }
    }
    /deep/ .el-form-item__label {
      font-size: 14px;
      font-family: MicrosoftYaHei;
      line-height: 52px;
      height: 52px;
      color: #808080;
      font-weight: normal;
    }
    /deep/ .el-select {
      width: 100%;
    }
    /deep/ .el-input__inner {
      line-height: 52px;
      height: 52px;
      font-size: 14px;
      width: 362px;
      font-family: MicrosoftYaHei;
    }
    .dialog-footer {
      display: flex;
      justify-content: space-around;
      /deep/ .el-button {
        width: 216px;
        height: 52px;
        font-size: 16px;
        font-family: MicrosoftYaHei;
      }
    }
  }
}
/deep/ .el-select {
  display: inline-block;
  position: relative;
  width: 250px;
}
</style>


