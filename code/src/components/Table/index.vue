<template>
  <div class="table-container">
    <slot name="top" v-if="update"></slot>
    <el-table
      height="calc(100vh - 250px)"
      v-loading="listLoading"
      :data="list"
      :empty-text="$t('table.empty')"
      style="width: 100%;margin-top: 34px;color: #808080;font-family:MicrosoftYaHei;"
    >
      <el-table-column
        align="center"
        v-for="(lable, index) in lables"
        :key="index"
        :label="lable.name"
        :width="lable.width"
      >
        <template slot-scope="scope" >
          <span v-if="lable.type=='image'" ><img :src="scope.row[`${lable.value}`]" class="avatar_image"><img/></span>
          <span v-else >{{ scope.row[`${lable.value}`] }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="tableOption" width="350px"  :label="tableOption.name" align="center">
        <template slot-scope="scope" v-if="scope.row.department_parent_id !== 0&&scope.row.role_name!=='Administrator'">
          <el-button
            v-for="(item, index) in tableOption.options"
            :key=" index"
            v-show="item.auth==true"
            :type="item.type"
            :size="item.size"
            :class="item.textcolor"
            @click="handleButton(item.methods,scope.row)"
          >{{item.label}}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
export default {
  props: ["tableData", "labelData", "listLoading", "Option"],
  data() {
    return {
      list: this.tableData,
      lables: this.labelData
    };
  },
  watch: {
    // 当父组件该数据发生变化，子组件需要监听其变化重新赋值
    tableData: {
      handler(newVal, oldVal) {
        this.list = newVal
      },
      deep: true,
      immediate: true
    },
  },
  computed: {
    ...mapGetters(['control','update','read','authDelete']),
      tableOption(){
        try {
             this.Option.options.map(item => {
          if (item.methods=='editRechange'){
            item.auth=this.update
          } else if(item.methods=='delectRechange'){
            item.auth=this.authDelete
          } else if(item.methods=='longRange'){
            item.auth=this.control
          }
         return item
      })
        } catch (error) {
      return null
        }
      return this.Option || null
      }
  },
  created() {
  },
  methods: {
    handleButton(method, row) {
      this.$emit("handleButton", { method: method, row: row })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/.el-table::before {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0px;
}
/deep/ .el-button--text{
  padding-left: 24px;
  padding-right: 24px;
}
.table-container {
  padding: 30px 32px 0px 32px;
  background-color: #fff;
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
  .textcolor{
    color: red;
  }
  .avatar_image{
    width: 80px;
    height: 80px;
  }
}
</style>
