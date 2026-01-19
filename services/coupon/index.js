import { config } from '../../config/index';
import request from '../../utils/request';

const getUserNo = () => {
  const userInfo = wx.getStorageSync('userInfo') || {};
  return userInfo.no || '';
};

/** 获取优惠券列表 */
function mockFetchCoupon(status) {
  const { delay } = require('../_utils/delay');
  const { getCouponList } = require('../../model/coupon');
  return delay().then(() => getCouponList(status));
}

/** 获取优惠券列表 */
export function fetchCouponList(status = 'default') {
  if (config.useMock) {
    return mockFetchCoupon(status);
  }
  const userNo = getUserNo();
  if (!userNo) {
    return Promise.resolve({ data: [] });
  }
  return request({
    url: `/coupon/user/${userNo}`,
    method: 'GET',
  }).then((res) => {
    const list = res.data?.list || res.data || [];
    return {
      data: list.map((item) => ({
        id: item.no,
        couponId: item.no,
        type: item.type,
        title: item.description || '优惠券',
        value: Math.round((item.value || 0) * 100),
        base: Math.round((item.minimumAmount || 0) * 100),
        status,
        startTime: item.validFrom ? `${new Date(item.validFrom).getTime()}` : '',
        endTime: item.validUntil ? `${new Date(item.validUntil).getTime()}` : '',
      })),
    };
  });
}

/** 获取优惠券 详情 */
function mockFetchCouponDetail(id, status) {
  const { delay } = require('../_utils/delay');
  const { getCoupon } = require('../../model/coupon');
  const { genAddressList } = require('../../model/address');

  return delay().then(() => {
    const result = {
      detail: getCoupon(id, status),
      storeInfoList: genAddressList(),
    };

    result.detail.useNotes = `1个订单限用1张，除运费券外，不能与其它类型的优惠券叠加使用（运费券除外）\n2.仅适用于各区域正常售卖商品，不支持团购、抢购、预售类商品`;
    result.detail.storeAdapt = `商城通用`;

    if (result.detail.type === 'price') {
      result.detail.desc = `减免 ${result.detail.value / 100} 元`;

      if (result.detail.base) {
        result.detail.desc += `，满${result.detail.base / 100}元可用`;
      }

      result.detail.desc += '。';
    } else if (result.detail.type === 'discount') {
      result.detail.desc = `${result.detail.value}折`;

      if (result.detail.base) {
        result.detail.desc += `，满${result.detail.base / 100}元可用`;
      }

      result.detail.desc += '。';
    }

    return result;
  });
}

/** 获取优惠券 详情 */
export function fetchCouponDetail(id, status = 'default') {
  if (config.useMock) {
    return mockFetchCouponDetail(id, status);
  }
  return request({
    url: `/coupon/${id}`,
    method: 'GET',
  }).then((res) => {
    const detail = res.data || {};
    return {
      detail: {
        id: detail.no,
        type: detail.type,
        value: Math.round((detail.value || 0) * 100),
        base: Math.round((detail.minimumAmount || 0) * 100),
        status,
      },
      storeInfoList: [],
    };
  });
}
