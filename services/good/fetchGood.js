import { config } from '../../config/index';
import request from '../../utils/request';

/** 获取商品列表 */
function mockFetchGood(ID = 0) {
  const { delay } = require('../_utils/delay');
  const { genGood } = require('../../model/good');
  return delay().then(() => genGood(ID));
}

/** 获取商品列表 */
export function fetchGood(ID = 0) {
  if (config.useMock) {
    return mockFetchGood(ID);
  }
  return request({
    url: `/product/${ID}`,
    method: 'GET',
  }).then((res) => {
    const product = res.data || {};
    const price = Math.round((product.price || 0) * 100);
    const specId = 'default-spec';
    const specValueId = 'default-value';
    return {
      spuId: product.no,
      title: product.name || '商品',
      primaryImage: product.imgUrl || '',
      images: product.imgUrl ? [product.imgUrl] : [],
      minSalePrice: price,
      maxSalePrice: price,
      minLinePrice: price,
      maxLinePrice: price,
      spuStockQuantity: product.stockQuantity || 0,
      soldNum: product.soldNum || 0,
      isPutOnSale: product.status === '已上架' ? 1 : 0,
      specList: [
        {
          specId,
          title: '默认',
          specValueList: [
            {
              specValueId,
              specId,
              specValue: '默认',
              image: null,
            },
          ],
        },
      ],
      skuList: [
        {
          skuId: `${product.no}-sku`,
          skuImage: product.imgUrl || '',
          specInfo: [
            {
              specId,
              specTitle: null,
              specValueId,
              specValue: null,
            },
          ],
          priceInfo: [{ priceType: 1, price: `${price}`, priceTypeName: null }],
          stockInfo: {
            stockQuantity: product.stockQuantity || 0,
            safeStockQuantity: 0,
            soldQuantity: 0,
          },
          weight: null,
          volume: null,
          profitPrice: null,
        },
      ],
      desc: product.description ? [product.description] : [],
      spuTagList: product.tag ? [{ id: product.tag, title: product.tag, image: null }] : [],
      limitInfo: [],
      etitle: '',
      available: 1,
    };
  });
}
