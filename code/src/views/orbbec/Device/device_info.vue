<template>
  <div class="app-container">
      <Table
          ref="tabele"
          :tableData="list"
          :Option="tableOption"
          :labelData="labelData"
        >
          <!-- <el-button slot="top" type="primary" @click="handleCreate">{{ $t('table.add') }}</el-button> -->
        </Table>
 </div>
</template>

<script>
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
export default {
  components: { Pagination, Table },
  data() {
    return {
      listLoading:false,
       list: [{
         equipment_mac:'E13234235',
         name:'设备1',
         typeName:'进入',
         location:'前门',
         device_line: '在线',
        info: '设备相关信息',
         create_time:'2019.05.06',
       }],
           labelData: [{
        name: this.$t('device.device_Id'),
        type: 'string',
        value: 'equipment_mac'
      },
      {
        name: this.$t('device.device_Name'),
        type: 'string',
        value: 'name'
      },
      {
        name: this.$t('device.device_Address'),
        type: 'string',
        value: 'location'
      },
      {
        name: this.$t('device.device_line'),
        type: 'string',
        value: 'device_line'
      },
      
      {
        name: this.$t('device.device_Edition'),
        type: 'string',
        value: 'info'
      },
      {
        name: this.$t('device.device_CreatTime'),
        type: 'creatTime',
        value: 'create_time',
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
  methods:{
        handleButton(val) {
      if (val.method === "editRechange") {
        this.handleUpdate(val.row);
      } else {
        this.handleDelete(val.row);
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  height: calc(100vh - 85px);
 /deep/ .table-container{
   padding-top: 0px;
   margin-top: -15px;;
  }
}
</style>
