<template>
  <div class="app-container">
    
     <div class="drawer-container">
  <div class="container-item">
    <span>{{$t('table.Name')}}</span>
    <span>{{name}}</span>
  </div>
   <div class="container-item">
    <span>{{$t('table.Gender')}}</span>
    <span>{{gendername}}</span>
  </div>
   <div class="container-item">
    <span>{{$t('table.Email')}}</span>
    <span>{{email}}</span>
  </div>
   <div class="container-item">
    <span>{{$t('table.Role')}}</span>
    <span>{{role_name}}</span>
  </div>
   <div class="container-item">
    <span>{{$t('table.Store')}}</span>
    <span>{{storename}}</span>
  </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "PersonInfo",
  data() {
    return {
      dialogVisible: this.visibleDialog,
    }
  },
  computed: {
    ...mapState({
      name: state => state.user.name,
      gender: state => state.user.gender,
      email: state => state.user.email,
      role_name: state => state.user.role_name,
      store: state => state.user.store
    }),
    // 根据性别返回的数字计算gendername
    gendername(){
     return this.gender==0? '男':'女'
    },
     storename(){
     return this.store==0? '正常':'禁止'
    }
  },
  watch: {
   
  },
  mounted() {
  },
  methods: {
       // 关闭弹框，通知父组件
   closeDialog() {
    this.$emit('closeDialog',false)
   }
  }
}
</script>


<style lang="scss">

      .drawer-container {
        padding: 20px;
        margin: 10px auto;
        font-size: 14px;
        display: flex;
        flex-direction: column;
      .container-item{
        display: inline-block;
        flex-direction: row;
        height: 70px;
        line-height: 70px;
        padding: 0px 70px;
        span{
          margin-right: 46px;
        }
      }
    }

</style>
