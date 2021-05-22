<template>
  <div class="app-container theme-color">
    <div class="table-container">
      <el-button type="primary" @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-table
        height="calc(100vh - 250px)"
        :data="list"
        :empty-text="$t('table.empty')"
        style="width: 100%;margin-top: 34px;color: #808080;font-family:MicrosoftYaHei;"
      >
        <el-table-column
          align="center"
          v-for="(lable, index) in labelData"
          :key="index"
          :label="lable.name"
          :width="lable.width"
        >
          <template slot-scope="scope">
            <span v-if="scope.row[`${lable.value}`] == true ">
              <img src="@/assets/common/yes.png" class="yes" />
            </span>
            <span v-else-if="scope.row[`${lable.value}`] == false ">
              <img src="@/assets/common/no.png" class="no" />
            </span>
            <span v-else>{{ scope.row[`${lable.value}`] }}</span>
          </template>
        </el-table-column>
        <el-table-column width="300px" :label="$t('table.actions')" align="center">
          <template slot-scope="scope" v-if="scope.row.name !== 'Administrator' ">
            <el-button
              v-show="update"
              type="text"
              size="medium"
              @click="handleUpdate(scope.row)"
            >{{$t('table.edit')}}</el-button>
            <el-button
              v-show="authDelete"
              type="text"
              size="medium"
              class="textcolor"
              @click="handleDelete(scope.row)"
            >{{$t('table.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :page_num.sync="listQuery.page_num"
      @pagination="getList"
    />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        :rules="rules"
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
          <template v-if="label.type=='checkbox'">
            <el-checkbox-group v-model="temp[`${label.value}`]" @change="handleCheckedAuthChange">
              <el-checkbox
                v-for="(child,index) in label.childrens"
                :key="index"
                :label="child.value"
              >{{child.name}}</el-checkbox>
            </el-checkbox-group>
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
import { roleList, createRole, editRole, deleteRole } from "@/api/systemMag";
import checkPermission from "@/utils/permission"; // 鏉冮檺鍒ゆ柇鍑芥暟
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { validateAddress } from "@/utils/validate";

export default {
  components: { Pagination, Table },
  data() {
    return {
      labelDataDialog: [
        {
          name: this.$t("RoleMag.roleName"),
          type: "string",
          value: "name",
          placeholder: "请输入角色名称"
        },
        {
          name: this.$t("RoleMag.authMag"),
          type: "checkbox",
          value: "checkedAuths",
          childrens: [
            {
              name: '浏览权限',
              value: 1
            },
            {
              name: '编辑权限',
              value: 2
            },
            {
              name: '删除权限',
              value: 4
            }
          ]
        },

        // {
        //   name: this.$t("RoleMag.sidebarMag"),
        //   type: "checkbox",
        //   value: "checkedAuths",
        //   childrens: [
        //     {
        //       name: "监控统计",
        //       value: 5
        //     },
        //     {
        //       name: "任务监控",
        //       value: 6
        //     },
        //     {
        //       name: "容器管理",
        //       value: 7
        //     },

        //     {
        //       name: "主机管理",
        //       value: 8
        //     },
        //     {
        //       name: "系统管理",
        //       value: 9
        //     }
        //   ]
        // }
      ],
      labelData: [
        {
          name: '角色名称',
          type: "string",
          value: "name"
        },
        {
          name:'浏览权限',
          type: "img",
          value: "read"
        },
        {
          name: '编辑权限',
          type: "img",
          value: "update"
        },
        {
          name: '删除权限',
          type: "img",
          value: "delete"
        },
        // {
        //   name: "监控统计",
        //   type: "img",
        //   value: "monitor"
        // },
        // {
        //   name: "任务监控",
        //   type: "img",
        //   value: "task"
        // },
        // {
        //   name: "容器管理",
        //   type: "img",
        //   value: "container"
        // },

        // {
        //   name: "主机管理",
        //   type: "img",
        //   value: "host"
        // },
        // {
        //   name: "系统管理",
        //   type: "img",
        //   value: "system"
        // }
      ],
      rules: {
        name: [
          {
            required: true,
            message: "请输入正确的角色名称",
            trigger: "change"
          },
          { validator: validateAddress, trigger: "blur" },
          { min: 1, max: 64, message: "字数再1--64之间" }
        ]
      },
      loadingStatus: false,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        page_num: 20
      },
      tempRow: {},
      temp: {
        name: "",
        checkedAuths: []
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: this.$t("table.edit"),
        create: this.$t("table.add")
      }
    };
  },
  created() {
    this.getList();
  },

  computed: {
    ...mapGetters([
      "role_name",
      "role_id",
      "control",
      "update",
      "read",
      "authDelete",
      "monitor",
      "task",
      "container",
      "system",
      "monitor",
      "task",
      "container",
      "host",
      "system"
    ])
  },
  methods: {
    // 澶嶉€夋 鏉冮檺璁剧疆
    handleCheckedAuthChange(value) {
      console.log(this.temp.checkedAuths);
    },
    handleButton(val) {
      if (val.method == "editRechange") {
        this.handleUpdate(val.row);
      } else {
        this.handleDelete(val.row);
      }
    },

    handleDelete(row) {
      this.$confirm("是否删除当前角色?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteRole(row.role_id).then(response => {
            this.list = this.list.filter(item => {
              return item.role_id !== row.role_id;
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
            message: "取消删除！"
          });
        });
    },
    checkPermission,
    getList() {
      this.listLoading = true;
      if (this.total < (this.listQuery.page - 1) * this.listQuery.page_num) {
        this.listQuery.page = 1;
      }
      roleList(this.listQuery).then(response => {
        let arr = [];
        response.roles.forEach(auth => {
          let obj = {};
          let authNum;
          try {
            authNum = auth.modules[0].op;
          } catch (error) {
            authNum = 612;
          }
          obj.name = auth.name;
          obj.role_id = auth.role_id;
          obj.read = (authNum & 0x02) !== 0 ? true : false;
          obj.update = (authNum & 0x04) !== 0 ? true : false;
          obj.delete = (authNum & 0x08) !== 0 ? true : false;
          obj.control = (authNum & 0x10) !== 0 ? true : false;

          obj.monitor = (authNum & 0x20) !== 0 ? true : false;
          obj.task = (authNum & 0x40) !== 0 ? true : false;
          obj.container = (authNum & 0x80) !== 0 ? true : false;
          obj.host = (authNum & 0x100) !== 0 ? true : false;
          obj.system = (authNum & 0x200) !== 0 ? true : false;

          arr.push(obj);
        });
        this.list = arr;
        this.total = response.total_num;
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 0 * 1000);
      });
    },
    resetTemp() {
      this.temp = {
        name: "",
        checkedAuths: []
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
          let obj = {};
          let arr = [];
          let objsmall = {};
          obj.name = this.temp.name;
          objsmall.module_id = 1;
          objsmall.name = "common";
          console.log(this.temp.checkedAuths);
          let read = this.temp.checkedAuths.includes(1);
          let update = this.temp.checkedAuths.includes(2);
          let control = this.temp.checkedAuths.includes(3);
          let deleteAuth = this.temp.checkedAuths.includes(4);

          let monitor = this.temp.checkedAuths.includes(5);
          let task = this.temp.checkedAuths.includes(6);
          let container = this.temp.checkedAuths.includes(7);
          let host = this.temp.checkedAuths.includes(8);
          let system = this.temp.checkedAuths.includes(9);

          objsmall.op =
            (read ? 0x02 : 0) +
            (update ? 0x04 : 0) +
            (deleteAuth ? 0x08 : 0) +
            (control ? 0x10 : 0) +
            (monitor ? 0x20 : 0) +
            (task ? 0x40 : 0) +
            (container ? 0x80 : 0) +
            (host ? 0x100 : 0) +
            (system ? 0x200 : 0);

          arr.push(objsmall);
          obj.modules = arr;
          createRole(obj)
            .then(() => {
              this.loadingStatus = false;
              this.dialogFormVisible = false;
              this.getList();
              this.$notify({
                title: "提示",
                message: "新增成功！",
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
      let obj = {};
      let arr = [];
      obj.name = row.name;
      obj.role_id = row.role_id;
      if (row.read) {
        arr.push(1);
      }
      if (row.update) {
        arr.push(2);
      }
      if (row.control) {
        arr.push(3);
      }
      if (row.delete) {
        arr.push(4);
      }
      if (row.monitor) {
        arr.push(5);
      }
      if (row.task) {
        arr.push(6);
      }
      if (row.container) {
        arr.push(7);
      }
      if (row.host) {
        arr.push(8);
      }
      if (row.system) {
        arr.push(9);
      }

      obj.checkedAuths = arr;
      this.temp = Object.assign({}, obj);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData(newValue) {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          let tempData = Object.assign({}, this.temp);
          this.loadingStatus = true;
          let obj = {};
          let arr = [];
          let objsmall = {};
          obj.role_id = tempData.role_id;
          obj.name = this.temp.name;
          objsmall.module_id = 1;
          objsmall.name = "common";
          let read = tempData.checkedAuths.includes(1);
          let update = tempData.checkedAuths.includes(2);
          let control = tempData.checkedAuths.includes(3);
          let deleteAuth = tempData.checkedAuths.includes(4);

          let monitor = tempData.checkedAuths.includes(5);
          let task = tempData.checkedAuths.includes(6);
          let container = tempData.checkedAuths.includes(7);
          let host = tempData.checkedAuths.includes(8);
          let system = tempData.checkedAuths.includes(9);

          objsmall.op =
            (read ? 0x02 : 0) +
            (update ? 0x04 : 0) +
            (deleteAuth ? 0x08 : 0) +
            (control ? 0x10 : 0)+
            (monitor ? 0x20 : 0) +
            (task ? 0x40 : 0) +
            (container ? 0x80 : 0) +
            (host ? 0x100 : 0) +
            (system ? 0x200 : 0);
          arr.push(objsmall);
          obj.modules = arr;
          editRole(obj)
            .then(() => {
              this.loadingStatus = false;
              for (const v of this.list) {
                if (v.role_id === this.temp.role_id) {
                  let objAuth = {};
                  objAuth.name = this.temp.name;
                  objAuth.role_id = this.temp.role_id;
                  objAuth.role_name = this.temp.name;
                  objAuth.read = tempData.checkedAuths.includes(1);
                  objAuth.update = tempData.checkedAuths.includes(2);
                  objAuth.control = tempData.checkedAuths.includes(3);
                  objAuth.delete = tempData.checkedAuths.includes(4);

                  objAuth.monitor = tempData.checkedAuths.includes(5);
                  objAuth.task = tempData.checkedAuths.includes(6);
                  objAuth.container = tempData.checkedAuths.includes(7);
                  objAuth.host = tempData.checkedAuths.includes(8);
                  objAuth.system = tempData.checkedAuths.includes(9);

                  if (this.role_id == this.temp.role_id) {
                    this.$store.dispatch("user/modifyAuth", objAuth);
                    // debugger
                    this.$store.dispatch("user/changeRoles", obj); //更改状�?  需要再方法前面加上文件对应目录
                    console.log('修改了当前用户的角色--------user/modifyAuth',obj)
                  }
                  const index = this.list.indexOf(v);
                  this.list.splice(index, 1, objAuth);
                  break;
                }
              }
              this.dialogFormVisible = false;
              this.$notify({
                title: "提示",
                message: "修改成功",
                type: "success",
                duration: 2000
              });
            })
            .catch(() => {
              this.loadingStatus = false;
            });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  margin: 20px 77px 0px 20px;
  font-family: MicrosoftYaHei;
  overflow: auto;
  .no {
    width: 18px;
    height: 18px;
  }
  .yes {
    width: 24px;
    height: 16px;
  }
  /deep/.el-table::before {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0px;
  }
  .table-container {
    padding: 10px 32px 10px 12px;
    /deep/ .el-table--border {
      border: none;
    }

    /deep/ .el-table th > .cell {
      position: relative;
      word-wrap: normal;
      text-overflow: ellipsis;
      display: inline-block;
      vertical-align: middle;
      width: 100%;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      font-weight: 500;
    }
    /deep/ .el-table__header {
      height: 59px;
      line-height: 59px;
      font-weight: normal !important;
    }
    .textcolor {
      color: red;
      font-family: MicrosoftYaHei;
    }
    /deep/ .el-button--text {
      padding-left: 24px;
      padding-right: 24px;
    }
  }
  /deep/ .el-dialog {
    width: 540px;
    padding-bottom: 19px;
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
      padding: 30px 20px 0px;
      color: #606266;
      font-size: 14px;
      font-family: MicrosoftYaHei;
    }
    /deep/ .el-form-item {
      margin-bottom: 34px;
    }
    /deep/ .el-form-item__label {
      font-size: 14px;
      font-family: MicrosoftYaHei;
      line-height: 52px;
      height: 52px;
      color: #808080;
      font-weight: normal;
    }
    /deep/ .el-form-item__content {
      display: flex;
      align-items: center;
    }
    /deep/ .el-checkbox {
      width: 30%;
      margin-left: 30px;
      // /deep/ .el-checkbox__inner{
      //     width: 26px;
      //     height: 26px;
      //     display: flex;
      //      align-items: center;
      //      text-align: center;
      //      vertical-align: middle;
      // }
    }

    /deep/ .el-input__inner {
      line-height: 52px;
      height: 52px;
      font-size: 14px;
      width: 362px;
    }
    /deep/ .el-dialog__footer {
      margin-top: -10px;
      padding-top: 0px;
      padding-bottom: 30px;
      .dialog-footer {
        display: flex;
        justify-content: space-around;
      }

      /deep/ .el-button {
        width: 215px;
        height: 52px;
        font-size: 16px;
      }
    }
  }
}
</style>