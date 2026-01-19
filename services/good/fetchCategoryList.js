import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取商品列表 */
function mockFetchGoodCategory() {
  const { delay } = require('../_utils/delay');
  const { getCategoryList } = require('../../model/category');
  return delay().then(() => getCategoryList());
}

/** 获取商品列表 */
export function getCategoryList() {
  if (config.useMock) {
    return mockFetchGoodCategory();
  }
  return request({
    url: '/category/tree/list',
    method: 'GET',
  }).then((res) => {
    const formatNode = (node) => ({
      groupId: node.no,
      name: node.name,
      thumbnail: node.icon || '',
      children: (node.children || []).map(formatNode),
    });
    return (res.data || []).map(formatNode);
  });
}
