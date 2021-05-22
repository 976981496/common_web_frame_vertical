<template>
  <div class="app-container theme-bg">
    <el-tabs
      tab-position="left"
      v-model="activeName"
      class="myTabs"
      type="card"
      style="background-color: #fff;"
    >
      <el-tab-pane
        v-for="item in grouplist"
        :key="item.group_id"
        :label="item.name"
        :name="item.id"
      >
        <Table
          ref="tabele"
          :tableData="list"
          :Option="tableOption"
          :labelData="labelData"
          :listLoading="listLoading"
          @handleButton="handleButton"
        >
          <el-button slot="top" type="primary" @click="handleCreate">{{ $t('table.add') }}</el-button>
        </Table>
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="listQuery.page"
          :page_num.sync="listQuery.page_num"
          @pagination="getList"
        />
      </el-tab-pane>
    </el-tabs>

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
          v-for="(label,index) in labelDataDialog"
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
import store from "@/store";
import { mapGetters } from "vuex";
import {
  fetchList,
  createUser,
  editUser,
  deleteUser,
  roleList,
  groupList
} from "@/api/systemMag";
import checkPermission from "@/utils/permission"; // 权限判断函数
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
// import CreateEditDialog from '@/components/CreateEditDialog'
import { validateName, validateEmail } from "@/utils/validate";
import { filter } from "minimatch";
// import i18n from '@/lang'

export default {
  components: { Pagination, Table },
  data() {
    return {
      activeName: "0",
      // Dialog显示数据label
      labelDataDialog: [
        {
          name: this.$t("userMag.Name"),
          type: "string",
          value: "name",
          width: 220,
          placeholder: "请输入用户名称！"
        },
        {
          name: this.$t("userMag.userEmail"),
          type: "string",
          value: "email",
          width: 220,
          placeholder: "请输入用户邮箱！"
        },
        {
          name: this.$t("userMag.Group"),
          type: "select",
          value: "group_id",
          width: 220,
          placeholder: "请选择所属分组！"
        },
        {
          name: this.$t("userMag.Gender"),
          type: "radio",
          value: "gender",
          width: 200,
          childrens: [
            {
              name: "男",
              value: 0
            },
            {
              name: "女",
              value: 1
            }
          ]
        },
        {
          name: this.$t("userMag.RoleName"),
          type: "select",
          value: "role_id",
          width: 220,
          placeholder: "请选择用户角色"
        },
        {
          name: this.$t("userMag.user_Store"),
          type: "radio",
          value: "state",
          width: 220,
          childrens: [
            {
              name: "正常",
              value: 0
            },
            {
              name: "禁止",
              value: 1
            }
          ]
        }
      ],
      // 表格显示数据
      labelData: [
        {
          name: this.$t("userMag.Name"),
          type: "string",
          value: "name"
        },
        {
          name: this.$t("userMag.userEmail"),
          type: "string",
          value: "email"
        },
        {
          name: this.$t("userMag.Gender"),
          type: "radio",
          value: "genderName"
        },

        {
          name: this.$t("userMag.RoleName"),
          type: "select",
          value: "role_name"
        },
        {
          name: this.$t("userMag.Group"),
          type: "select",
          value: "group"
        },
        {
          name: this.$t("userMag.user_Store"),
          type: "radio",
          value: "stateName"
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
      // loadingStatus: false,
      list: [],
      dataList: null,
      rolelist: null,
      grouplist: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 0,
        page_num: 20,
        group_id: "0"
      },
      temp: {
        name: "",
        email: "",
        group: "",
        gender: 0,
        role_id: "",
        state: 0
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: this.$t("table.edit"),
        create: this.$t("table.add")
      },
      rules: {
        name: [
          { required: true, message: "请填写用户名称！", trigger: "change" },
          { validator: validateName, trigger: "blur" },
          { min: 1, max: 64, message: "长度在1 -- 64 个字符内" }
        ],
        email: [
          { required: true, message: "请填写用户邮箱！", trigger: "change" },
          { validator: validateEmail, trigger: "blur" }
        ],
        group: [
          { required: true, message: "请选择用户所属分组！", trigger: "change" }
        ],
        gender: [
          { required: true, message: "请选择用户性别", trigger: "change" }
        ],
        role_id: [
          { required: true, message: "请选择用户角色", trigger: "change" }
        ],
        state: [
          { required: true, message: "请选择用户状态！", trigger: "change" }
        ]
      }
    };
  },
  computed: {
    ...mapGetters([
      "user_id",
      "role_id",
      "control",
      "update",
      "read",
      "authDelete"
    ])
  },
  created() {
    this.getRoleList();
    this.getGroupList();
    this.getList();
  },

  watch: {
    activeName: {
      handler(newName, oldName) {
        console.log("activeName", newName, oldName);
        this.listQuery.group_id = newName;
        this.getList();
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    //  handleClick(tab, event) {
    //       console.log(tab, event);
    //       console.log(this.activeName);
    //     },
    handleButton(val) {
      if (val.method === "editRechange") {
        this.handleUpdate(val.row);
      } else {
        this.handleDelete(val.row);
      }
    },
    handleDelete(row) {
      this.$confirm("确认删除改用户?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteUser(row.user_id).then(response => {
            this.list = this.list.filter(item => {
              return item.user_id != row.user_id;
            });
            this.total--;
            this.$message({
              type: "success",
              message: "删除成功!"
            });
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删"
          });
        });
    },
    checkPermission,
    getList() {
      this.listLoading = true;
      if (this.total < (this.listQuery.page - 1) * this.listQuery.page_num) {
        this.listQuery.page = 1;
      }
      fetchList(this.listQuery).then(response => {
        this.list = response.users.map(item => {
          if (item.gender === 1 && item.state === 1) {
            item.genderName = "女";
            item.stateName = "禁止";
          } else if (item.gender === 0 && item.state === 1) {
            item.genderName = "男";
            item.stateName = "禁止";
          } else if (item.gender === 1 && item.state === 0) {
            item.genderName = "女";
            item.stateName = "正常";
          } else if (item.gender === 0 && item.state === 0) {
            item.genderName = "男";
            item.stateName = "正常";
          }
          return item;
        });
        this.total = response.total_num;
        setTimeout(() => {
          this.listLoading = false;
        }, 0 * 1000);
      });
    },
    // 新建用户时，选择角色
    getRoleList() {
      roleList().then(response => {
        this.rolelist = response.roles;
        const len = this.labelData.length;
        for (let i = 0; i < len; i++) {
          if (this.labelDataDialog[i].value === "role_id") {
            this.labelDataDialog[i].childrens = response.roles;
          }
        }
      });
    },
    // 新建用户时，选择分组
    getGroupList() {
      groupList().then(response => {
        this.grouplist = response.groups;
        this.activeName = String(response.groups[0].group_id);

        const len = this.labelData.length;
        for (let i = 0; i < len; i++) {
          if (this.labelDataDialog[i].value === "group_id") {
            this.labelDataDialog[i].childrens = response.groups;
          }
        }
      });
    },
    resetTemp() {
      this.temp = {
        name: "",
        email: "",
        group_id: "",
        gender: 0,
        role_id: "",
        state: 0
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
          // this.loadingStatus = true
          createUser(this.temp)
            .then(() => {
              // this.loadingStatus = false
              this.dialogFormVisible = false;
              this.getList();
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
            })
            .catch(() => {
              // this.loadingStatus = false,
              this.$notify.error({
                title: "错误",
                message: "添加失败"
              });
            });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData(newValue) {
      console.log(newValue);
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          delete tempData.genderName;
          delete tempData.stateName;
          delete tempData.role_name;
          // this.loadingStatus = true
          editUser(tempData)
            .then(() => {
              this.loadingStatus = false;
              for (const v of this.list) {
                if (v.user_id === this.temp.user_id) {
                  let roleNow = [];
                  roleNow = this.rolelist.filter(item => {
                    return item.role_id === this.temp.role_id;
                  });
                  this.temp.role_name = roleNow[0].name;
                  // let groupNow = [];
                  // groupNow = this.grouplist.filter(item => {
                  //   return item.group_id === this.temp.group_id;
                  // });
                  // this.temp.group = groupNow[0].name;
                  //  修改用户角色  要将用户角色数据变为状态存储模式，改变状态�?
                  let obj = {};
                  let authNum;
                  try {
                    authNum = roleNow[0].modules[0].op;
                  } catch (error) {
                    authNum = 32;
                  }
                  obj.role_name = roleNow[0].name;
                  obj.read = (authNum & 0x02) !== 0 ? true : false;
                  obj.update = (authNum & 0x04) !== 0 ? true : false;
                  obj.delete = (authNum & 0x08) !== 0 ? true : false;
                  obj.control = (authNum & 0x10) !== 0 ? true : false;

                  if (this.user_id == this.temp.user_id) {
                    if (this.role_id !== this.temp.role_id) {
                      this.$store.dispatch("user/modifyAuth", obj); //更改状态 需要再方法前面加上文件对应目录
                      this.$store.dispatch("user/changeRoles", roleNow[0]); //更改状�?  需要再方法前面加上文件对应目录
                    }
                  }
                  this.getList();
                  // if (tempData.gender === 1 && tempData.state === 1) {
                  //   this.temp.genderName = "女";
                  //   this.temp.stateName = "禁止";
                  // } else if (tempData.gender === 0 && tempData.state === 1) {
                  //   this.temp.genderName = "男";
                  //   this.temp.stateName = "禁止";
                  // } else if (tempData.gender === 1 && tempData.state === 0) {
                  //   this.temp.genderName = "女";
                  //   this.temp.stateName = "正常";
                  // } else if (tempData.gender === 0 && tempData.state === 0) {
                  //   this.temp.genderName = "男";
                  //   this.temp.stateName = "正常";
                  // }
                  // const index = this.list.indexOf(v);
                  // this.list.splice(index, 1, this.temp);
                }
              }
              this.dialogFormVisible = false;
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000
              });
            })
            .catch(() => {
              // this.loadingStatus = false
            });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
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
</style>
