import { getCategoryList } from '../../services/good/fetchCategoryList';
Page({
  data: {
    list: [],
    goodsList: [],
    activeKey: 0,
    goodsLoading: false,
  },
  async init() {
    try {
      const result = await getCategoryList();
      this.setData({
        list: result,
      });
      // 默认加载第一个分类的商品
      if (result && result.length > 0) {
        this.fetchGoods(result[0].groupId);
      }
    } catch (error) {
      console.error('err:', error);
    }
  },

  onShow() {
    this.getTabBar().init();
  },
  onChange(e) {
    // 侧边栏切换分类
    // 检查 e.detail 的类型，如果是数组取第一个元素，如果是对象取 index 属性，否则直接使用
    let index = 0;
    if (Array.isArray(e.detail)) {
      index = e.detail[0];
    } else if (typeof e.detail === 'object' && e.detail !== null && 'index' in e.detail) {
      index = e.detail.index;
    } else {
      index = e.detail;
    }

    const category = this.data.list[index];
    if (category) {
      this.setData({ activeKey: index });
      this.fetchGoods(category.groupId);
    }
  },
  
  // 获取分类商品
  async fetchGoods(categoryId) {
    this.setData({ goodsLoading: true });
    const { fetchGoodsList } = require('../../services/good/fetchGoods');
    try {
      const { list } = await fetchGoodsList({ categoryId, page: 1, pageSize: 20 });
      this.setData({ goodsList: list, goodsLoading: false });
    } catch (error) {
      console.error('获取商品列表失败', error);
      this.setData({ goodsList: [], goodsLoading: false });
    }
  },

  onGoodsClick(e) {
    const { spuId } = e.detail.goods;
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
  },

  onAddCart(e) {
    const { spuId } = e.detail.goods;
     wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
  },
  onLoad() {
    this.init(true);
  },
});
