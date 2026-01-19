import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取售后单mock数据 */
function mockFetchRightsPreview(params) {
  const { delay } = require('../_utils/delay');
  const { genRightsPreview } = require('../../model/order/applyService');

  return delay().then(() => genRightsPreview(params));
}

/** 获取售后单数据 */
export function fetchRightsPreview(params) {
  if (config.useMock) {
    return mockFetchRightsPreview(params);
  }
  const { orderNo, skuId, spuId, numOfSku = 1 } = params || {};
  return request({
    url: `/order/mp/detail/${orderNo}`,
    method: 'GET',
  }).then((res) => {
    const order = res.data || {};
    const orderItem =
      (order.orderItemVOs || []).find((item) => item.skuId === skuId) ||
      (order.orderItemVOs || []).find((item) => item.spuId === spuId);
    const paidAmountEach = orderItem?.goodsPaymentPrice || '0';
    const refundableAmount = orderItem?.itemPaymentAmount || '0';
    return {
      data: {
        saasId: '88888888',
        uid: order.uid || '',
        storeId: order.storeId || '1000',
        skuId,
        spuId,
        numOfSku,
        numOfSkuAvailable: numOfSku,
        refundableAmount,
        refundableDiscountAmount: '0',
        shippingFeeIncluded: '0',
        paidAmountEach,
        boughtQuantity: orderItem?.buyQuantity || 1,
        orderNo,
        goodsInfo: {
          goodsName: orderItem?.goodsName || '商品',
          skuImage: orderItem?.goodsPictureUrl || '',
          specInfo: orderItem?.specifications || [],
        },
      },
    };
  });
}

/** 确认收货 */
export function dispatchConfirmReceived() {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay();
  }

  return Promise.resolve({});
}

/** 获取可选的mock售后原因列表 */
function mockFetchApplyReasonList(params) {
  const { delay } = require('../_utils/delay');
  const { genApplyReasonList } = require('../../model/order/applyService');

  return delay().then(() => genApplyReasonList(params));
}

/** 获取可选的售后原因列表 */
export function fetchApplyReasonList(params) {
  if (config.useMock) {
    return mockFetchApplyReasonList(params);
  }
  return Promise.resolve({
    data: [
      { type: 1, desc: '不想要了' },
      { type: 2, desc: '商品有问题' },
      { type: 3, desc: '发错/漏发' },
    ],
  });
}

/** 发起mock售后申请 */
function mockDispatchApplyService(params) {
  const { delay } = require('../_utils/delay');
  const { applyService } = require('../../model/order/applyService');

  return delay().then(() => applyService(params));
}

/** 发起售后申请 */
export function dispatchApplyService(params) {
  if (config.useMock) {
    return mockDispatchApplyService(params);
  }
  return request({
    url: '/refund/apply',
    method: 'POST',
    data: {
      orderNo: params?.orderNo,
      reason: params?.reason,
      amount: params?.amount,
      evidence: params?.rightsImageUrls || [],
    },
  }).then((res) => res);
}
