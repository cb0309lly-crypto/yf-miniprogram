/* eslint-disable no-param-reassign */
import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取搜索历史 */
function mockSearchResult(params) {
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
      if (item.spuTagList) {
        item.tags = item.spuTagList.map((tag) => ({ title: tag.title }));
      } else {
        item.tags = [];
      }
    });
  }
  return delay().then(() => {
    return data;
  });
}

/** 获取搜索历史 */
export function getSearchResult(params) {
  if (config.useMock) {
    return mockSearchResult(params);
  }
  const { pageNum = 1, pageSize = 10, keyword } = params || {};
  return request({
    url: '/product/list',
    method: 'GET',
    data: {
      page: pageNum,
      pageSize,
      keyword,
    },
  }).then((res) => {
    const list = (res.data?.list || []).map((item) => ({
      spuId: item.no,
      thumb: item.imgUrl,
      title: item.name,
      price: Math.round((item.price || 0) * 100),
      originPrice: Math.round((item.price || 0) * 100),
      tags: item.tag ? [{ title: item.tag }] : [],
      primaryImage: item.imgUrl,
      minSalePrice: Math.round((item.price || 0) * 100),
      maxLinePrice: Math.round((item.price || 0) * 100),
      spuTagList: item.tag ? [{ title: item.tag }] : [],
    }));
    return {
      spuList: list,
      totalCount: res.data?.total || 0,
    };
  });
}
