import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取商品评论 */
function mockFetchComments(parmas) {
  const { delay } = require('../_utils/delay');
  const { getGoodsAllComments } = require('../../model/comments');
  return delay().then(() => getGoodsAllComments(parmas));
}

/** 获取商品评论 */
export function fetchComments(parmas) {
  if (config.useMock) {
    return mockFetchComments(parmas);
  }
  const { pageNum = 1, pageSize = 10, spuId } = parmas || {};
  return request({
    url: `/review/product/${spuId || ''}`,
    method: 'GET',
    data: {
      page: pageNum,
      limit: pageSize,
    },
  }).then((res) => {
    const list = res.data || [];
    return {
      comments: list.map((item) => ({
        commentId: item.no,
        spuId: item.productNo,
        userName: item.user?.nickname || '用户',
        userHeadUrl: item.user?.avatar || '',
        commentScore: item.rating || 5,
        commentContent: item.content || '',
        commentTime: item.reviewTime ? `${new Date(item.reviewTime).getTime()}` : '',
        isAnonymity: false,
        images: item.images || [],
        commentTag: [],
      })),
      totalCount: list.length,
    };
  });
}
