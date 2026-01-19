import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取评价商品 */
function mockGetGoods(parameter) {
  const { delay } = require('../_utils/delay');
  const { getGoods } = require('../../model/submitComment');
  const data = getGoods(parameter);

  return delay().then(() => {
    return data;
  });
}

/** 获取评价商品 */
export function getGoods(parameter) {
  if (config.useMock) {
    return mockGetGoods(parameter);
  }
  return request({
    url: `/order/mp/detail/${parameter}`,
    method: 'GET',
  }).then((res) => {
    const order = res.data || {};
    return {
      goodsInfo: order.orderItemVOs || [],
    };
  });
}
