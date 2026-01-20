import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取商品列表 */
function mockFetchGoodsList(pageIndex = 1, pageSize = 20) {
  const { delay } = require('../_utils/delay');
  const { getGoodsList } = require('../../model/goods');
  return delay().then(() =>
    getGoodsList(pageIndex, pageSize).map((item) => {
      return {
        spuId: item.spuId,
        thumb: item.primaryImage,
        title: item.title,
        price: item.minSalePrice,
        originPrice: item.maxLinePrice,
        tags: item.spuTagList.map((tag) => tag.title),
      };
    }),
  );
}

/** 获取商品列表 */
export function fetchGoodsList(params) {
  if (config.useMock) {
    return mockFetchGoodsList(params.page || 1, params.pageSize || 20);
  }
  const { categoryId, page, pageSize } = params;
  const data = {
    page: page || 1,
    pageSize: pageSize || 20,
    status: '已上架',
  };
  
  if (categoryId) {
    data.categoryNo = categoryId;
  }
  
  return request({
    url: '/product/list',
    method: 'GET',
    data,
  }).then((res) => {
    const list = (res.data?.list || []).map((item) => ({
      spuId: item.no,
      thumb: item.imgUrl,
      title: item.name,
      price: Math.round((item.price || 0) * 100),
      originPrice: Math.round((item.marketPrice || item.price || 0) * 100),
      tags: item.tag ? [item.tag] : [],
    }));
    return { list, total: res.data?.total || 0 };
  });
}
