import { config } from '../../config/index';
import request from '../../utils/request';

const getUserNo = () => {
  const userInfo = wx.getStorageSync('userInfo') || {};
  return userInfo.no || '';
};

const toCentString = (value) => `${Math.round((Number(value) || 0) * 100)}`;

/** 获取购物车mock数据 */
function mockFetchCartGroupData(params) {
  const { delay } = require('../_utils/delay');
  const { genCartGroupData } = require('../../model/cart');

  return delay().then(() => genCartGroupData(params));
}

/** 获取购物车数据 */
export function fetchCartGroupData(params) {
  if (config.useMock) {
    return mockFetchCartGroupData(params);
  }
  const userNo = getUserNo();
  if (!userNo) {
    return Promise.resolve({
      data: {
        isNotEmpty: false,
        storeGoods: [],
        invalidGoodItems: [],
      },
    });
  }

  return request({
    url: `/cart/user/${userNo}`,
    method: 'GET',
  }).then((res) => {
    const items = res.data?.items || [];
    const goodsPromotionList = items.map((item) => ({
      uid: item.userNo,
      saasId: '88888888',
      storeId: '1000',
      spuId: item.productNo,
      skuId: item.no,
      isSelected: item.selected ? 1 : 0,
      thumb: item.product?.imgUrl || '',
      title: item.product?.name || '商品',
      primaryImage: item.product?.imgUrl || '',
      quantity: item.quantity,
      stockStatus: true,
      stockQuantity: 999,
      price: toCentString(item.unitPrice),
      originPrice: toCentString(item.unitPrice),
      tagPrice: null,
      titlePrefixTags: null,
      roomId: null,
      specInfo: [],
      joinCartTime: item.addedAt,
      available: 1,
      putOnSale: 1,
      etitle: null,
    }));

    return {
      data: {
        isNotEmpty: goodsPromotionList.length > 0,
        storeGoods: [
          {
            storeId: '1000',
            storeName: '默认门店',
            storeStatus: 1,
            totalDiscountSalePrice: toCentString(res.data?.totalPrice || 0),
            promotionGoodsList: [
              {
                title: null,
                promotionCode: 'EMPTY_PROMOTION',
                promotionSubCode: null,
                promotionId: null,
                tagText: null,
                promotionStatus: null,
                tag: null,
                description: null,
                doorSillRemain: null,
                isNeedAddOnShop: 0,
                goodsPromotionList,
              },
            ],
            shortageGoodsList: [],
          },
        ],
        invalidGoodItems: [],
      },
    };
  });
}

/** 添加商品到购物车 */
export function addToCart(params) {
  const { productNo, quantity } = params;
  const userNo = getUserNo();
  
  if (!userNo) {
    return Promise.reject({ msg: '请先登录' });
  }

  return request({
    url: '/cart/add',
    method: 'POST',
    data: {
      userNo,
      productNo,
      quantity
    }
  });
}

/** 更新购物车商品选中状态 */
export function updateCartItemSelection(cartId, isSelected) {
  return request({
    url: `/cart/${cartId}`,
    method: 'PUT',
    data: {
      no: cartId,
      selected: isSelected
    }
  });
}

/** 全选/取消全选 */
export function selectAllCartItems(isSelected) {
  const userNo = getUserNo();
  return request({
    url: '/cart/select-all',
    method: 'POST',
    data: {
      userNo,
      isSelected
    }
  });
}

/** 删除购物车商品 */
export function deleteCartItem(cartId) {
  return request({
    url: `/cart/${cartId}`,
    method: 'DELETE',
    data: {
      no: cartId
    }
  });
}

/** 更新购物车商品数量 */
export function updateCartItemQuantity(cartId, quantity) {
  return request({
    url: '/cart/update-quantity',
    method: 'POST',
    data: {
      no: cartId,
      quantity
    }
  });
}
