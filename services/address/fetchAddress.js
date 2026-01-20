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
      addressId: address.no,
      name: address.name || '',
      phoneNumber: address.phone || '',
      phone: address.phone || '',
      address: address.address || '',
      provinceName: address.province || '',
      cityName: address.city || '',
      districtName: address.district || '',
      detailAddress: address.address || '',
      tag: address.tag || '',
      addressTag: address.tag || '',
      isDefault: address.isDefault ? 1 : 0,
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
      addressId: address.no,
      name: address.name || '',
      phoneNumber: address.phone || '',
      phone: address.phone || '',
      address: `${address.province || ''}${address.city || ''}${address.district || ''}${address.address || ''}`,
      provinceName: address.province || '',
      cityName: address.city || '',
      districtName: address.district || '',
      detailAddress: address.address || '',
      tag: address.tag || '',
      addressTag: address.tag || '',
      isDefault: address.isDefault ? 1 : 0,
    }));
  });
}

/** 新增收货地址 */
export function addAddress(params) {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay().then(() => ({ ...params, id: `${Date.now()}` }));
  }
  return request({
    url: '/receiver',
    method: 'POST',
    data: {
      name: params.name,
      phone: params.phone,
      province: params.provinceName,
      city: params.cityName,
      district: params.districtName,
      address: params.detailAddress,
      isDefault: params.isDefault === 1 || params.isDefault === true,
      tag: params.addressTag,
      userNo: getUserNo(),
      groupBy: 1, // 默认分组
    },
  });
}

/** 修改收货地址 */
export function modifyAddress(params) {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay().then(() => params);
  }
  return request({
    url: '/receiver',
    method: 'PUT',
    data: {
      no: params.addressId,
      name: params.name,
      phone: params.phone,
      province: params.provinceName,
      city: params.cityName,
      district: params.districtName,
      address: params.detailAddress,
      isDefault: params.isDefault === 1 || params.isDefault === true,
      tag: params.addressTag,
      userNo: getUserNo(),
    },
  });
}

/** 删除收货地址 */
export function deleteAddress(id) {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay();
  }
  return request({
    url: `/receiver/${id}`,
    method: 'DELETE',
  });
}
