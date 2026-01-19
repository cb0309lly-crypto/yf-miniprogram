import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取个人中心信息 */
function mockFetchPerson() {
  const { delay } = require('../_utils/delay');
  const { genSimpleUserInfo } = require('../../model/usercenter');
  const { genAddress } = require('../../model/address');
  const address = genAddress();
  return delay().then(() => ({
    ...genSimpleUserInfo(),
    address: {
      provinceName: address.provinceName,
      provinceCode: address.provinceCode,
      cityName: address.cityName,
      cityCode: address.cityCode,
    },
  }));
}

/** 获取个人中心信息 */
export function fetchPerson() {
  if (config.useMock) {
    return mockFetchPerson();
  }
  return request({
    url: '/auth/user_info',
    method: 'GET',
  }).then(async (res) => {
    const addressList = await request({
      url: '/receiver/list',
      method: 'GET',
      data: {
        page: 1,
        pageSize: 1,
      },
    });
    const address = (addressList.data?.list || [])[0];
    return {
      ...(res.data || res),
      address: address
        ? {
            provinceName: '',
            provinceCode: '',
            cityName: '',
            cityCode: '',
          }
        : null,
    };
  });
}
