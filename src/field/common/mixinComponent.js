function outPutInfo(flag) {
  return flag ? true : "%s格式不正确";
}

export let extendRules = function (rules = {}) {
  if (Object.prototype.toString.call(rules) !== '[object Object]') throw new Error('extendRule variable need Object');
  __RULES__ = Object.assign({}, __RULES__, rules);
};

let __RULES__ = {
  //验证对象，如果通过则返回bool型的true，否则返回验证不通过的提示字符串，其中可以带%s，以便进一步处理。
  email(value) {
    return outPutInfo(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value));
  },
  mobile(value) {  //手机号码验证
    return outPutInfo(/^[1][3578]\d{9}$/.test(value))
  },
  tel(value) {   //座机号码验证
    return outPutInfo(/^([0-9]{3,4}-)?[0-9]{7,8}$/.test(value))
  },
  cardId(value) {   //身份证验证
    return outPutInfo(/(^\d{15}$)|(^\d{17}(\d|x|X)$)/i.test(value))
  },
  integer(value) {  //整数验证
    return outPutInfo(/^-?[1-9]\d*$/.test(value))
  },
  decimal(value) {  //小数验证
    return outPutInfo(/^\d+\.*\d*$/.test(value))
  },
  require(value) {  //空字符串验证
    return outPutInfo(value && value !== '')
  },
};

export let formRulesMixin = {
  data() {
    return {
      R: __RULES__,
      partialPiginator: {totalPages: 10, totalElements: 10},
      param: {paginator: {size: 20, page: 1}}
    }
  },
  computed: {
    paginator() {
      return Object.assign({},
        this.partialPiginator,
        this.param.paginator
      );
    }
  },
  methods: {
    r(required) {//规则组合器
      var context = this;
      var add = function (trigger, checkerandtiparray) {
        var addItem = function (rule, errormsg, trigger) {
          this.rules.push({checker: rule, required: this.defaultRequired, context, errormsg, trigger});
        }

        var tip = null, checker = null;
        for (var i = 0; i < checkerandtiparray.length; i++) {

          if (typeof(checkerandtiparray[i]) == 'function') {
            checker = checkerandtiparray[i];
          } else {
            tip = checkerandtiparray[i];
          }

          if (checker != null) {
            addItem.call(this, checker, tip, trigger);
            tip = null, checker = null;
          }
        }
      }

      var ruler = {
        defaultRequired: false,//默认是不做必须校验要求
        rules: [],
        blur: function () {
          add.call(this, 'blur', arguments);
          return this
        },
        change: function () {
          add.call(this, 'change', arguments);
          return this
        },
        all: function () {

          add.call(this, '', arguments);
          return this
        },
        r: function (required) {
          this.defaultRequired = !!required;
          return this;
        }
      };
      return ruler.r(required);
    },
    mutate(mutation, variables) {
      return this.$apollo.mutate({
        mutation: mutation,
        variables: variables,
      });
    },
    querys(query, variables) {
      return this.$apollo.query({
        query: query,
        variables: variables,
        fetchPolicy: 'network-only'
      });
    },


    //便利方法，供在apollo:配置块中使用。设置好默认值，只要给一个query对象或者gql字符串即可
    getEntityQuery(queryObject, skipFunction) {
      queryObject = queryObject.query ? queryObject : {query: queryObject};
      var target = {
//        loadingKey: 'loading',
        update: function (data) {
          var deepclonedata = JSON.parse(JSON.stringify(data));
          var jqlname = Object.keys(deepclonedata)[0];
          var result = deepclonedata[jqlname];
          //处理分页问题
          if (result && result.hasOwnProperty('totalPages')) {
            this.partialPiginator.totalPages = result.totalPages;
          }
          if (result && result.hasOwnProperty('totalElements')) {
            this.partialPiginator.totalElements = result.totalElements;
          }
          return !result ? null : (result.hasOwnProperty('content') ? result.content : result);
        },//如果需要使用this来代表vm，则不能使用=>函数，因为箭头函数的this与所在闭包this相同
        variables() {
          return this.param;
        },
        skip() {
          return skipFunction ? skipFunction.call(this) : false;
        },
        deep: true,
        fetchPolicy: 'network-only'
      };

      Object.assign(target, queryObject);
      return target;
    },
    gqlMutate(graphql, variables, sCallback) {
      this.mutate(graphql, variables).then((data) => {
        if (data.errors) {   //未通过服务端的表单验证
          this.$message.error(`${data.errors}`);
        }
        else {
          sCallback.call(this, data);
        }
      })
    },
    gqlQuer(graphql, variables, sCallback) {
      this.querys(graphql, variables).then((data) => {
        if (data.errors) {   //未通过服务端的表单验证
          this.$message.error(`${data.errors}`);
        }
        else {
          sCallback.call(this, data);
        }
      })
    },


//路由处理信息
    routerPush(path, queryObject) {
      this.$router.push({path: path, query: queryObject});
    },
    routerBack() {
      this.$router.back();
    }


  },
};
