import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取商品详情页评论数 */
function mockFetchGoodDetailsCommentsCount(spuId = 0) {
  const { delay } = require('../_utils/delay');
  const {
    getGoodsDetailsCommentsCount,
  } = require('../../model/detailsComments');
  return delay().then(() => getGoodsDetailsCommentsCount(spuId));
}

/** 获取商品详情页评论数 */
export function getGoodsDetailsCommentsCount(spuId = 0) {
  if (config.useMock) {
    return mockFetchGoodDetailsCommentsCount(spuId);
  }
  return request({
    url: `/review/product/${spuId}`,
    method: 'GET',
    data: {
      page: 1,
      limit: 100,
    },
  }).then((res) => {
    const list = res.data || [];
    const commentCount = list.length;
    const goodCount = list.filter((item) => (item.rating || 0) >= 4).length;
    const middleCount = list.filter((item) => (item.rating || 0) === 3).length;
    const badCount = list.filter((item) => (item.rating || 0) <= 2).length;
    const hasImageCount = list.filter((item) => (item.images || []).length > 0).length;
    const goodRate = commentCount ? (goodCount / commentCount) * 100 : 0;
    return {
      badCount,
      commentCount,
      goodCount,
      goodRate,
      hasImageCount,
      middleCount,
    };
  });
}

/** 获取商品详情页评论 */
function mockFetchGoodDetailsCommentList(spuId = 0) {
  const { delay } = require('../_utils/delay');
  const { getGoodsDetailsComments } = require('../../model/detailsComments');
  return delay().then(() => getGoodsDetailsComments(spuId));
}

/** 获取商品详情页评论 */
export function getGoodsDetailsCommentList(spuId = 0) {
  if (config.useMock) {
    return mockFetchGoodDetailsCommentList(spuId);
  }
  return request({
    url: `/review/product/${spuId}`,
    method: 'GET',
    data: {
      page: 1,
      limit: 10,
    },
  }).then((res) => {
    const list = res.data || [];
    return {
      homePageComments: list.map((item) => ({
        spuId: item.productNo,
        userName: item.user?.nickname || '用户',
        commentScore: item.rating || 5,
        commentContent: item.content || '',
        userHeadUrl: item.user?.avatar || '',
        isAnonymity: false,
      })),
    };
  });
}
