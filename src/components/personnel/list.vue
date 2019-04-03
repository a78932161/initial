<template>
  <div class="list">
    <div style="width: 100%">
      <tree v-if="data" :treeData="data" @treeChange="treeChange" @handleNodeClick="handleNodeClick"></tree>
    </div>
    <div style="width: 100%">
      <div style="text-align: center">
        <span>{{tableTitle.name}}</span>
        <el-button @click="addUser">添加用户</el-button>
      </div>
      <el-table :data="list" class="_list" v-loading.body="$apollo.queries.list.loading"
                element-loading-text="Loading"
                fit highlight-current-row>
        <bos-table-column lable="id" field="id"></bos-table-column>
        <bos-table-column lable="姓名" field="username"></bos-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="">修改</el-button>
          </template>
        </el-table-column>
      </el-table>

      <field-dialog title="添加角色" ref="dialog" @confirm="dialogConfirm">
        <form-container ref="inlineForm" :model="inlineForm">
          <field-input v-model="inlineForm.username" label="用户名" width="10"
                       :rules="r(true).all(R.require)" prop="username"></field-input>
          <field-input v-model="inlineForm.password" label="密码" width="10"
                       :rules="r(true).all(R.require)" prop="password"></field-input>
          <field-select label="角色" v-model="inlineForm.role" width="5"
                        :rules="r(true).all(R.require)"
                        prop="role"
                        :list="[{val:'dPQnSjaPEN_8WWnol_ZJv3R01',key:'管理员'},{val:'Di0ujMQ2G_mHi7Aj6gM1n0R01',key:'警员'},{val:'HFWW8cpvGmuZXBM57qZfV2R01',key:'领导'}]"></field-select>

        </form-container>
      </field-dialog>
      <bos-paginator :pageInfo="paginator" @bosCurrentPageChanged="changePage"/>
    </div>
  </div>
</template>

<script>
  import api from 'graph/list.graphql';
  import {historyPageMixin} from 'common/js/mixin';
  import tree from './slot_tree'

  export default {
    data() {
      return {
        param: {
          id: '',
        },
        data: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        value: true,
        tableTitle: '',
        title: '添加节点',
        inlineForm: {
          username: '',
          password: '',
          role: '',
          roleItems: [],
        },
      }
    },
    components: {
      tree
    },

    apollo: {
      list() {
        return this.getEntityQuery(api.getUserList);
      },
    },
    mixins: [historyPageMixin],
    mounted() {
      this.getList();
    },
    methods: {
      handleNodeClick(data) {
        this.param.id = data.id;
        this.tableTitle = data;
      },
      loop(list) {
        list.forEach(item => {
          // item['label'] = JSON.parse(JSON.stringify(item.name));
          delete item['__typename'];
          if (item.organUnitSet) {
            item['children'] = JSON.parse(JSON.stringify(item.organUnitSet));
            this.loop(item.children);
          }
          delete item['organUnitSet'];
        })
      },
      getList() {
        this.gqlQuer(api.getOrganUnitListList, {}, (res) => {
          this.data = JSON.parse(JSON.stringify(res.data.OrganUnitList.content));
          this.loop(this.data);
          console.log(this.data);
        });
      },
      treeChange(data) {
        this.getList();
      },
      addUser() {
        this.inlineForm = {};
        this.$nextTick(() => {    //dialog框出现以后，进行清空验证
          this.$refs.inlineForm.clearValidate();
        });
        this.$refs.dialog.show();
      },
      dialogConfirm() {
        this.inlineForm.roleItems = [{id: this.inlineForm.role}];
        this.inlineForm['organUnit'] = {id: this.tableTitle.id};
        console.log(this.inlineForm);
        this.$refs.inlineForm.gqlValidate(api.identity_saveUser, {
          user: this.inlineForm
        }, () => {
          this.callback(`添加成功`);
          this.$refs.dialog.hide();
        });
      },
    }
  }
</script>

<style lang="scss" scoped>
  .list {
    /*display: flex;*/
  }
</style>
