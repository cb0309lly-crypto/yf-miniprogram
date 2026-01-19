import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取个人中心信息 */
function mockFetchUserCenter() {
  const { delay } = require('../_utils/delay');
  const { genUsercenter } = require('../../model/usercenter');
  return delay(200).then(() => genUsercenter());
}

/** 获取个人中心信息 */
export function fetchUserCenter() {
  if (config.useMock) {
    return mockFetchUserCenter();
  }
  return request({
    url: '/auth/user_info',
    method: 'GET',
  }).then(async (res) => {
    const orderCount = await request({
      url: '/order/mp/count',
      method: 'GET',
    });
    return {
      userInfo: res.data || res.user || res,
      countsData: [],
      orderTagInfos: orderCount.data || [],
      customerServiceInfo: {},
    };
  });
}
