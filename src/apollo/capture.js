/**
 * Created by Administrator on 2018/8/22.
 */
import {removeToken} from 'common/js/auth';
import store from '../store'
import {Message} from 'element-ui'

function capture(error) {
  console.log(error.gqlError.status);
  let statusCode = error.gqlError.status;
  switch (statusCode) {
    case 401:
      store.commit('SET_TOKEN', '');
      store.commit('SET_ROLES', []);
      removeToken();
      Message.success({
        message: '用户已经过期!'
      });
      location.reload();
      break;
  }


  // let statusCode = error.networkError.statusCode;
  // console.log(statusCode);
  // switch (statusCode) {
  //   case 401:
  //     store.commit('SET_TOKEN', '');
  //     store.commit('SET_ROLES', []);
  //     removeToken();
  //     location.reload();
  //     break;
  // }
}

export default capture;
