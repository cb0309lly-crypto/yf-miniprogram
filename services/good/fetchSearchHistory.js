import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取搜索历史 */
function mockSearchHistory() {
  const { delay } = require('../_utils/delay');
  const { getSearchHistory } = require('../../model/search');
  return delay().then(() => getSearchHistory());
}

/** 获取搜索历史 */
export function getSearchHistory() {
  if (config.useMock) {
    return mockSearchHistory();
  }
  return request({
    url: '/product/search/history',
    method: 'GET',
  }).then((res) => res.data || []);
}

/** 获取搜索历史 */
function mockSearchPopular() {
  const { delay } = require('../_utils/delay');
  const { getSearchPopular } = require('../../model/search');
  return delay().then(() => getSearchPopular());
}

/** 获取搜索历史 */
export function getSearchPopular() {
  if (config.useMock) {
    return mockSearchPopular();
  }
  return request({
    url: '/product/search/popular',
    method: 'GET',
  }).then((res) => res.data || []);
}
