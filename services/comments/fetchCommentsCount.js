import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取商品评论数 */
function mockFetchCommentsCount(ID = 0) {
  const { delay } = require('../_utils/delay');
  const { getGoodsCommentsCount } = require('../../model/comments');
  return delay().then(() => getGoodsCommentsCount(ID));
}

/** 获取商品评论数 */
export function fetchCommentsCount(ID = 0) {
  if (config.useMock) {
    return mockFetchCommentsCount(ID);
  }
  return request({
    url: `/review/product/${ID}`,
    method: 'GET',
    data: {
      page: 1,
      limit: 200,
    },
  }).then((res) => {
    const list = res.data || [];
    return {
      commentCount: list.length,
      hasImageCount: list.filter((item) => (item.images || []).length > 0).length,
      goodCount: list.filter((item) => (item.rating || 0) >= 4).length,
      middleCount: list.filter((item) => (item.rating || 0) === 3).length,
      badCount: list.filter((item) => (item.rating || 0) <= 2).length,
      goodRate: list.length
        ? Math.round((list.filter((item) => (item.rating || 0) >= 4).length / list.length) * 1000) / 10
        : 0,
    };
  });
}
