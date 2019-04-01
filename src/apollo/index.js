/**
 * Created by Administrator on 2018/7/19.
 */
import Vue from 'vue'
import {ApolloClient} from 'apollo-client'
import {HttpLink} from 'apollo-link-http'
import {InMemoryCache} from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
import {ApolloLink, concat, split} from 'apollo-link';
import {onError} from 'apollo-link-error';
import {Message} from 'element-ui'
import {removeToken} from 'common/js/auth';

import {getToken} from 'common/js/auth'
import {tokenName} from 'api/config';
import capture from './capture';
import store from "../store";

const httpLink = new HttpLink({
  uri: 'https://www.buymycar.cn/carmall/graphql',
  // uri: 'http://115.159.154.194/carmall/graphql'
});


const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      [tokenName]: getToken() || null,
    }
  });
  return forward(operation).map(response => {
    return response
  });
});


const errorLink = onError(({networkError, response}) => {
  let errorMsg = '';
  if (!!response && response.errors !== undefined && response.errors.length) {
    errorMsg = !response.errors[0].message ? '服务器错误' : response.errors[0].message
    Message.error({
      message: errorMsg
    });
  }
  if (!!networkError) {
    errorMsg = networkError.message
    if (networkError.result !== undefined) {
      errorMsg = networkError.result.success === false ? networkError.result.message : networkError.result.error
      Message.error({
        message: errorMsg
      });
    }
    if (networkError['statusCode'] === 401) {
      store.commit('SET_TOKEN', '');
      store.commit('SET_ROLES', []);
      removeToken();
      Message.error({
        message: '用户已经过期!'
      });
    }
  }


});

const authLink = authMiddleware.concat(httpLink)


// Create the apollo client
const apolloClient = new ApolloClient({
  link: errorLink.concat(authLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

// Install the vue plugin
Vue.use(VueApollo);


const apolloProvider = new VueApollo({
  errorHandler(error) {
    capture(error);
  },

  defaultClient: apolloClient,
  defaultOptions: {
    // See 'apollo' definition
    // For example: default query options
    $query: {
      loadingKey: 'loading',
      /**
       * fetchPolicy determines where the client may return a result from. The options are:
       * - cache-first (default): return result from cache. Only fetch from network if cached result is not available.
       * - cache-and-network: return result from cache first (if it exists), then return network result once it's available.
       * - cache-only: return result from cache if available, fail otherwise.
       * - no-cache: return result from network, fail if network call doesn't succeed, don't save to cache
       * - network-only: return result from network, fail if network call doesn't succeed, save to cache
       * - standby: only for queries that aren't actively watched, but should be available for refetch and updateQueries.


       export type FetchPolicy =
       | 'cache-first'
       | 'cache-and-network'
       | 'network-only'
       | 'cache-only'
       | 'no-cache'
       | 'standby';
       */
      fetchPolicy: 'no-cache',
    },
  },
});
export default apolloProvider.provide();
