import { config } from '../../config/index';
import request from '../../utils/request';

const getUserNo = () => {
  const userInfo = wx.getStorageSync('userInfo') || {};
  return userInfo.no || '';
};

/** 获取收货地址 */
function mockFetchDeliveryAddress(id) {
  const { delay } = require('../_utils/delay');
  const { genAddress } = require('../../model/address');

  return delay().then(() => genAddress(id));
}

/** 获取收货地址 */
export function fetchDeliveryAddress(id = 0) {
  if (config.useMock) {
    return mockFetchDeliveryAddress(id);
  }
  return request({
    url: `/receiver/${id}`,
    method: 'GET',
  }).then((res) => {
    const address = res.data || {};
    return {
      ...address,
      id: address.no,
      name: address.name || '',
      phoneNumber: address.phone || '',
      address: address.address || '',
      provinceName: '',
      cityName: '',
      districtName: '',
      detailAddress: address.address || '',
      tag: '',
      addressTag: '',
    };
  });
}

/** 获取收货地址列表 */
function mockFetchDeliveryAddressList(len = 0) {
  const { delay } = require('../_utils/delay');
  const { genAddressList } = require('../../model/address');

  return delay().then(() =>
    genAddressList(len).map((address) => {
      return {
        ...address,
        phoneNumber: address.phone,
        address: `${address.provinceName}${address.cityName}${address.districtName}${address.detailAddress}`,
        tag: address.addressTag,
      };
    }),
  );
}

/** 获取收货地址列表 */
export function fetchDeliveryAddressList(len = 10) {
  if (config.useMock) {
    return mockFetchDeliveryAddressList(len);
  }
  return request({
    url: '/receiver/list',
    method: 'GET',
    data: {
      page: 1,
      pageSize: len,
      userNo: getUserNo(),
    },
  }).then((res) => {
    const list = res.data?.list || [];
    return list.map((address) => ({
      ...address,
      id: address.no,
      name: address.name || '',
      phoneNumber: address.phone || '',
      address: address.address || '',
      provinceName: '',
      cityName: '',
      districtName: '',
      detailAddress: address.address || '',
      tag: '',
      addressTag: '',
    }));
  });
}
