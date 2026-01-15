/* eslint-disable no-param-reassign */
import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取商品列表 */
function mockFetchGoodsList(params) {
  const { delay } = require('../_utils/delay');
  const { getSearchResult } = require('../../model/search');

  const data = getSearchResult(params);

  if (data.spuList.length) {
    data.spuList.forEach((item) => {
      item.spuId = item.spuId;
      item.thumb = item.primaryImage;
      item.title = item.title;
      item.price = item.minSalePrice;
      item.originPrice = item.maxLinePrice;
      item.desc = '';
      if (item.spuTagList) {
        item.tags = item.spuTagList.map((tag) => tag.title);
      } else {
        item.tags = [];
      }
    });
  }
  return delay().then(() => {
    return data;
  });
}

/** 获取商品列表 */
export function fetchGoodsList(params) {
  if (config.useMock) {
    return mockFetchGoodsList(params);
  }
  return request({
    url: '/product/list',
    method: 'GET',
    data: params
  }).then(res => {
    // 转换后端数据格式以适配小程序 UI
    const list = (res.data?.list || []).map(item => ({
      spuId: item.no,
      thumb: item.imgUrl,
      title: item.name,
      price: item.price * 100, // 分为单位
      originPrice: item.price * 120, // 模拟原价
      tags: item.tag ? [item.tag] : [],
    }));
    return {
      spuList: list,
      totalCount: res.data?.total || 0
    };
  });
}
