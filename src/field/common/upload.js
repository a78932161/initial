/**
 * Created by Administrator on 2018/8/15.
 */

import {baseURL} from "api/config";


export let _upload = function (variables) {
  uploadVariables.sts = variables.sts;
  uploadVariables.prefix = variables.prefix;
};

export let uploadVariables = {
  sts: '',
  prefix: ''
};
