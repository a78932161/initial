<template>
  <div>
    <div class="app-container">

      <form-container :model="param" class="_search">
        <field-input class="searchInput" placeholder="请输入手机号或用户名" label="搜索关键字" :wrapforlike="true"
                     v-model="param.namelike"></field-input>
        <el-button type="primary" style="margin-left: 15px">查询</el-button>
        <el-button type="primary" @click="dialogShow('add')">增加账号</el-button>
      </form-container>
    </div>

    <el-table :data="list" class="_list" v-loading.body="$apollo.queries.list.loading" element-loading-text="Loading"
              fit highlight-current-row>
      <bos-table-column lable="账号" field="username" width="180"></bos-table-column>
      <bos-table-column lable="拥有角色" field="roleItems" :filter="(row)=>getRole(row.roleItems)"></bos-table-column>
      <bos-table-column lable="创建时间" field="createtime" width="200"
                        :filter="(row)=>formatTime(row.createtime)"
      ></bos-table-column>
      <bos-table-column lable="手机" field="phone"></bos-table-column>
      <bos-table-column lable="门店" field="store.name"></bos-table-column>
      <bos-table-column lable="状态" field="disabled"
                        :filter="(row)=>adminStatus(row.disabled)"
      ></bos-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope" v-if="scope.row.roleItems[0].role.name!='超级管理员'">
          <el-button type="text" size="mini" @click="dialogShow('edit',scope.row)">修改</el-button>
          <el-button type="text" size="mini"
                     @click="deleteOne(scope.row)" class="_remote-tip">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <bos-paginator :pageInfo="paginator" @bosCurrentPageChanged="changePage"/>

    <field-dialog :title="title" ref="dialog" @confirm="dialogConfirm">
      <form-container ref="inlineForm" :model="inlineForm">
        <field-input v-model="inlineForm.username" :disabled="dialogType!='add'" label="账号名" width="10"
                     :rules="r(true).all(R.require)" prop="username"></field-input>
        <field-input v-model="inlineForm.password" label="密码" width="10"
                     :rules="r(true).all(R.require)" prop="password"></field-input>
        <div v-if="dialogType == 'add'">
          <field-input v-model="inlineForm.phone" label="手机号" width="10"
                       :rules="r(true).all(R.mobile)" prop="phone"></field-input>
          <field-select label="角色" v-model="inlineForm.roles" width="5"
                        :rules="r(true).all(R.require)"
                        prop="roles"
                        :list="[{val:'平台管理员',key:'平台管理员'},{val:'门店管理员',key:'门店管理员'}]"></field-select>

          <field-select label="门店" v-model="inlineForm['stores']" width="5"
                        :rules="r(true).all(R.require)"
                        prop="stores" :list="storeList1"
                        v-if="inlineForm.roles=='门店管理员'||inlineForm.roles=='销售顾问'"
          ></field-select>
        </div>


        <!--<el-form-item label="角色" label-width="120px">-->
        <!--<checkbox1 all="全选" :list="checkList" :chosen="chosen" @dataList="dataList"></checkbox1>-->
        <!--</el-form-item>-->
        <!--<el-form-item label=约束规则 label-width="120px">
          <el-input placeholder="请输入规则" v-for="(item, index) in ruleList" :key="index" v-model="ruleData[index]">
            <template slot="prepend">{{item.name}}</template>
          </el-input>
        </el-form-item>-->

      </form-container>
    </field-dialog>
  </div>

</template>

<script>


  import {filterAttr} from 'common/js'
  import apiAd from 'graph/admin.graphql';
  import {historyPageMixin} from 'common/js/mixin';
  import checkbox1 from '@/base/checkbox';

  export default {
    components: {
      checkbox1
    },
    data() {
      return {
        dialogType: '',
        inlineForm: {},
        roles: '',
        chosen: [],
        roleList: [],
        ruleData: [],
        checkList: [],
        rList: [],
        storeList: [],
      }
    },
    mixins: [historyPageMixin],
    apollo: {
      // rList() {//loadingKey
      //   //created的时候会执行一次，context代表的是vm对象，调试时可以查阅代码：vue-apollo.esm.js:  options = options.call(context)
      //   return this.getEntityQuery(apiAd.RoleList);
      // },
      list() {//loadingKey
        //created的时候会执行一次，context代表的是vm对象，调试时可以查阅代码：vue-apollo.esm.js:  options = options.call(context)
        return this.getEntityQuery(apiAd.AdministList);
      },
      // storeList() {
      //   return this.getEntityQuery(apiAd.getStoreList);
      // }
    },
    computed: {
      isDialogAdd() {
        return this.dialogType === 'add' ? true : false;
      },
      title() {
        return this.dialogType === 'add' ? '添加账号' : '修改账号';
      },
      storeList1() {
        let storeList = this.storeList,
          arr = [];
        if (!(storeList instanceof Array)) return arr;
        storeList.forEach((item, index) => {
          arr[index] = {key: item.name, val: item.id};
        });
        return arr;
      }
    },
    mounted() {
      this.getList();
    },
    methods: {
      getList() {
        this.gqlQuer(apiAd.RoleList, {}, (res) => {
          console.log(res);
          if (res.data.RoleList.content.length > 0) {
            this.rList = JSON.parse(JSON.stringify(res.data.RoleList.content));
          }
        });
        this.gqlQuer(apiAd.getStoreList, {}, (res) => {
          console.log(res);
          if (res.data.StoreList.content.length > 0) {
            this.storeList = JSON.parse(JSON.stringify(res.data.StoreList.content));
          }
        })
      },

      dataList(data) {
        this.roleList = data;
      },
      getRole(data) {
        let name = data.map((item) => {
          return item.role.name
        });
        return name.join(",")
      },
      adminStatus(disabled) {
        return disabled ? '删除' : "正常";
      },
      dialogShow(type, row) {
        this.chosen = [];
        this.checkList = [];
        this.roleList = [];
        this.dialogType = type;
        this.$refs.dialog.show();
        this.checkList = this.rList.map((item) => {
          return {id: item.id, name: item.name}
        });
        // console.log('checkList',this.checkList);
        this.$nextTick(() => {    //dialog框出现以后，进行清空验证
          this.$refs.inlineForm.clearValidate();
        });
        if (type === 'add') {
          this.inlineForm = {};
          return;
        } else {
          let adminList = this.list;
          let adRole;
          this.inlineForm = filterAttr(JSON.parse(JSON.stringify(row)));
          this.inlineForm['roles'] = this.inlineForm.roleItems[0].role.name;
          console.log(this.inlineForm);
          adminList.forEach((item) => {
            if (item.username == this.inlineForm.username) {
              adRole = item.roleItems;
              this.inlineForm['id'] = item.id
            }
          });
          adRole.forEach((item, index) => {
            this.checkList.forEach((check, checkIndex) => {
              if (item.role.id == check.id) {
                this.chosen.push(check);
              }
            })
          });
          this.roleList = this.chosen;
        }
      },

      dialogConfirm() {
        // this.inlineForm['roleItems'] = {};
        // this.inlineForm['roleItems'] = this.roleList.map((item) => {
        //   return {role: {id: item.id}}
        // });
        // if (this.dialogType === 'add') {
        // } else {
        //   console.log('rList', this.roleList);
        // }
        // console.log(this.inlineForm);
        let apiAdd = '';
        if (this.dialogType === 'add') {
          if (this.inlineForm.stores) {
            this.inlineForm.store = {id: this.inlineForm.stores};
          }
          console.log(this.inlineForm);

          switch (this.inlineForm.roles) {
            case '平台管理员':
              apiAdd = apiAd.admin_platformAdministrator;
              break;
            case '门店管理员':
              apiAdd = apiAd.admin_storeAdministrator;
              break;
            case '销售顾问':
              apiAdd = apiAd.admin_salesConsultant;
              break;
          }
        }

        this.$refs.inlineForm.gqlValidate(this.dialogType === 'add' ? apiAdd : apiAd.admin_changeOtherPassword,
          this.dialogType === 'add' ? {admin: this.inlineForm} : {
            password: this.inlineForm.password,
            username: this.inlineForm.username
          }, () => {
            this.callback(`${this.title}成功`);
            this.$refs.dialog.hide();
          });

      },
      deleteOne(row) {
        this.$confirm('此操作将删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.gqlMutate(apiAd.admin_delete, {
            id: row.id
          }, () => {
            this.callback('删除成功')
          })
        })
      }
    }
  }
</script>

