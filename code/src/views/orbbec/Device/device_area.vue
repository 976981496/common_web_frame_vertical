<template>
  <div class="app-container">
      <Table
          ref="tabele"
          :tableData="list"
          :Option="tableOption"
          :labelData="labelData"
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
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import store from "@/store";
import { mapGetters } from "vuex";
import {
  fetchList,
  createUser,
  editUser,
  deleteUser
} from "@/api/systemMag";
export default {
  components: { Pagination, Table },
  data() {
    return {
         dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: this.$t("table.edit"),
        create: this.$t("table.add")
      },
           temp: {
        name: "",
        remark: "",
      },
          rules: {
        name: [
          { required: true, message: "请填写区域名称！", trigger: "change" },
          { min: 1, max: 64, message: "长度在1 -- 64 个字符内" }
        ],
        remark: [
          { required: true, message: "请填写区域信息", trigger: "change" }
        ]
      },
       listQuery: {
        page: 0,
        page_num: 20
      },
      listLoading:false,
       list: [{
         name:'区域1',
         remark:'在13楼电梯口',
       },
       {
         name:'区域2',
         remark:'在大厅入口上方',
       }],
           labelData: [{
        name: '区域名称',
        type: 'string',
        value: 'name'
      },
      {
        name: '区域信息',
        type: 'string',
        value: 'remark'
      }],
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
    }
  },
  created() {
    // this.getList();
  },
  methods: {
    handleButton(val) {
      if (val.method === "editRechange") {
        this.handleUpdate(val.row);
      } else {
        this.handleDelete(val.row);
      }
    },
    getList() {
      this.listLoading = true;
      if (this.total < (this.listQuery.page - 1) * this.listQuery.page_num) {
        this.listQuery.page = 1;
      }
      fetchList(this.listQuery).then(response => {
        this.list = response.licenses
        this.total = response.total_num;
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
       resetTemp() {
      this.temp = {
        name: "",
        remaark: "",
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
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row);
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

    handleDelete(row) {
      this.$confirm("确认删除?", "提示", {
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
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  height: calc(100vh - 85px);
  .iframe-container{
    width: 100%;
    height: 100%;
    flex: 1;
    box-sizing: inherit;
  }
}
</style>
