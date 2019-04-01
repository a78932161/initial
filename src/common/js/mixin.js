import {getHistoryPage, setHistoryPage, removeHistoryPage} from 'common/js/auth';

export const historyPageMixin = {
  data() {
    return {
      param: {
        namelike: '%%'
      },
      oldName: '',
      oldPage: '',
      savePage: null
    }
  },
  created() {
    this._initPage();
    this.oldData = JSON.parse(JSON.stringify(this.param));
    this.$router.beforeEach((to, from, next) => {
      if (to.matched[0].name === from.matched[0].name) {
        this.savePage = true;
        next();
      } else {
        this.savePage = false;
        next();
      }
    })

  },
  destroyed() {
    if (!this.savePage) {
      removeHistoryPage();
    } else {

    }
  },
  methods: {
    _initPage() {
      this.$watch("param", (newValue) => {
        this.oldName = newValue.namelike;
        this.oldPage = newValue.paginator.page;
        this.saveHistoryPage(newValue.paginator.page);
        if (newValue.namelike !== '%%') {
          this.refetch();
        } else {
          this.refetch();
        }
      }, {deep: true});

      this.$watch("oldName", (newValue2, oldValue2) => {
        if (newValue2 !== '%%' && this.oldPage !== 1 && oldValue2 === '%%') {
          this.param.paginator.page = 1;
          this.refetch();
        } else {
          this.refetch();
        }
      });

      let historyPage = this.getHistoryPage();
      if (historyPage) {
        console.log('historyPage', historyPage);
        this.param.paginator.page = +historyPage; //分页组件的当前页数page同步
      }

    },
    changePage(page) {
      this.param.paginator.page = page;
      // this.saveHistoryPage(page);
    },
    getHistoryPage() {
      return getHistoryPage();
    },
    saveHistoryPage(page) {
      setHistoryPage(page);
    },
    refetch() {
      if (this.$apollo.queries['list']) this.$apollo.queries['list'].refetch();
    },
    callback(message) {
      this.$message.success(message);
      this.refetch();
    },
    formatTime(time) {
      if (time == null) return;
      return new Date(parseInt(time)).toLocaleString().replace(/:\d{1,2}$/, ' ');
    },
  }
};
