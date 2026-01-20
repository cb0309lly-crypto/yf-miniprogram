import { fetchHome } from '../../services/home/home';
import { fetchGoodsList } from '../../services/good/fetchGoods';
import { addToCart } from '../../services/cart/cart';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    imgSrcs: [],
    tabList: [],
    goodsList: [],
    goodsListLoadStatus: 0,
    pageLoading: false,
    current: 1,
    autoplay: true,
    duration: '500',
    interval: 5000,
    navigation: { type: 'dots' },
    swiperImageProps: { mode: 'aspectFill' },
  },

  goodListPagination: {
    index: 0,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    this.init();
  },

  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },

  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.loadHomePage();
  },

  loadHomePage() {
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: true,
    });
    fetchHome().then(({ swiper, tabList }) => {
      // 转换数据，确保 t-swiper 能读取到 value 字段作为图片
      const formattedSwiper = (swiper || []).map(item => {
        if (typeof item === 'string') return item;
        return {
          ...item,
          value: item.image || item.value 
        };
      });

      this.setData({
        tabList,
        imgSrcs: formattedSwiper,
        pageLoading: false,
      });
      this.loadGoodsList(true);
    });
  },

  tabChangeHandle(e) {
    // Check if e.detail is an object (e.g. {value: 1, label: '...'}) or a direct value
    const id = e.detail && typeof e.detail === 'object' && 'value' in e.detail 
      ? e.detail.value 
      : e.detail;
      
    this.privateData.tabIndex = id;
    this.loadGoodsList(true);
  },

  onReTry() {
    this.loadGoodsList();
  },

  async loadGoodsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({ goodsListLoadStatus: 1 });

    const pageSize = this.goodListPagination.num;
    let pageIndex = this.goodListPagination.index + 1;
    if (fresh) {
      pageIndex = 1;
    }

    try {
      const result = await fetchGoodsList({
        page: pageIndex,
        pageSize,
        categoryId: this.privateData.tabIndex,
      });
      const nextList = result.list;
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        goodsListLoadStatus: 0,
      });

      this.goodListPagination.index = pageIndex;
      this.goodListPagination.num = pageSize;
    } catch (err) {
      this.setData({ goodsListLoadStatus: 3 });
    }
  },

  goodListClickHandle(e) {
    const { index } = e.detail;
    const { spuId } = this.data.goodsList[index];
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
  },

  async goodListAddCartHandle(e) {
    const { index } = e.detail;
    const { spuId } = this.data.goodsList[index];
    
    try {
      await addToCart({
        productNo: spuId,
        quantity: 1,
      });
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加入购物车成功',
        theme: 'success',
      });
    } catch (err) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: err.message || err.msg || '加入购物车失败',
        theme: 'fail',
      });
    }
  },

  navToSearchPage() {
    wx.navigateTo({ url: '/pages/goods/search/index' });
  },

  navToActivityDetail({ detail }) {
    const { index } = detail || {};
    const item = this.data.imgSrcs[index];
    
    if (!item) return;

    // 如果配置了 url，优先跳转 url
    if (item.url) {
      // 判断是否是 tabBar 页面，如果是则使用 switchTab
      const isTabBar = ['/pages/home/home', '/pages/category/index', '/pages/cart/index', '/pages/usercenter/index'].some(path => item.url.startsWith(path));
      if (isTabBar) {
        wx.switchTab({ url: item.url });
      } else {
        wx.navigateTo({ url: item.url });
      }
      return;
    }
    
    // 兼容旧逻辑或处理 targetId
    if (item.targetId) {
       // 根据 type 跳转不同页面，这里示例跳转商品详情
       if (item.type === 'product') {
         wx.navigateTo({
           url: `/pages/goods/details/index?spuId=${item.targetId}`,
         });
       }
       return;
    }

    // 最后的兜底（虽然可能不准确）
    // const { index: promotionID = 0 } = detail || {};
    // wx.navigateTo({
    //   url: `/pages/promotion/promotion-detail/index?promotion_id=${promotionID}`,
    // });
  },
});
