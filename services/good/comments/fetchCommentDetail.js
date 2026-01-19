import { config } from '../../../config/index';
import { queryCommentDetail } from '../../../model/comments/queryDetail';
import request from '../../../utils/request';
/** 获取商品评价数据 */
function mockQueryCommentDetail(params) {
  const { delay } = require('../../_utils/delay');
  const data = queryCommentDetail(params);
  return delay().then(() => {
    return data;
  });
}

/** 获取评价详情 */
export function getCommentDetail(params) {
  if (config.useMock) {
    return mockQueryCommentDetail(params);
  }
  return request({
    url: `/review/${params}`,
    method: 'GET',
  }).then((res) => {
    const detail = res.data || {};
    return {
      commentId: detail.no,
      spuId: detail.productNo,
      userName: detail.user?.nickname || '用户',
      userHeadUrl: detail.user?.avatar || '',
      commentScore: detail.rating || 5,
      commentContent: detail.content || '',
      commentTime: detail.reviewTime ? `${new Date(detail.reviewTime).getTime()}` : '',
      isAnonymity: false,
      images: detail.images || [],
      commentTag: [],
    };
  });
}
