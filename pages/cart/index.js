import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  fetchCartGroupData,
  updateCartItemSelection,
  selectAllCartItems,
  deleteCartItem,
  updateCartItemQuantity,
} from '../../services/cart/cart';
import { checkLogin } from '../../utils/auth';

Page({
  data: {
    cartGroupData: null,
    isEditMode: false, // 是否处于编辑模式
  },

  // 调用自定义tabbar的init函数，使页面与tabbar激活状态保持一致
  onShow() {
    this.getTabBar().init();
    
    // 检查登录状态
    checkLogin({
      success: () => {
        // 已登录，刷新购物车数据
        this.refreshData();
      }
    });
  },

  onLoad() {
    // this.refreshData(); // Moved to onShow to ensure data is fresh
  },

  refreshData() {
    this.getCartGroupData().then((res) => {
      let isEmpty = true;
      const cartGroupData = res.data;
      let isAllSelected = true;
      let totalAmount = 0;
      let selectedGoodsCount = 0;
      
      // 一些组件中需要的字段可能接口并没有返回，或者返回的数据结构与预期不一致，需要在此先对数据做一些处理
      // 统计门店下加购的商品是否全选、是否存在缺货/无货
      for (const store of cartGroupData.storeGoods) {
        store.isSelected = true; // 该门店已加购商品是否全选
        store.storeStockShortage = false; // 该门店已加购商品是否存在库存不足
        if (!store.shortageGoodsList) {
          store.shortageGoodsList = []; // 该门店已加购商品如果库存为0需单独分组
        }
        for (const activity of store.promotionGoodsList) {
          activity.goodsPromotionList = activity.goodsPromotionList.filter((goods) => {
            goods.originPrice = undefined;

            // 统计是否有加购数大于库存数的商品
            if (goods.quantity > goods.stockQuantity) {
              store.storeStockShortage = true;
            }
            // 统计是否全选
            if (!goods.isSelected) {
              store.isSelected = false;
              isAllSelected = false;
            } else {
              selectedGoodsCount += goods.quantity;
              totalAmount += Number(goods.price) * goods.quantity;
            }
            // 库存为0（无货）的商品单独分组
            if (goods.stockQuantity > 0) {
              return true;
            }
            store.shortageGoodsList.push(goods);
            return false;
          });

          if (activity.goodsPromotionList.length > 0) {
            isEmpty = false;
          }
        }
        if (store.shortageGoodsList.length > 0) {
          isEmpty = false;
        }
      }
      cartGroupData.invalidGoodItems = cartGroupData.invalidGoodItems.map((goods) => {
        goods.originPrice = undefined;
        return goods;
      });
      cartGroupData.isNotEmpty = !isEmpty;
      
      if (!cartGroupData.isNotEmpty) {
        isAllSelected = false;
      }
      
      cartGroupData.isAllSelected = isAllSelected;
      cartGroupData.totalAmount = totalAmount;
      cartGroupData.selectedGoodsCount = selectedGoodsCount;
      
      this.setData({ cartGroupData });
    }).catch((err) => {
      // 处理 401 错误
      if (err.needLogin) {
        // 已经在 checkLogin 中处理了跳转
        return;
      }
      // 其他错误处理
      wx.showToast({
        title: err.message || '获取购物车数据失败',
        icon: 'none'
      });
    });
  },

  findGoods(spuId, skuId) {
    let currentStore;
    let currentActivity;
    let currentGoods;
    const { storeGoods } = this.data.cartGroupData;
    for (const store of storeGoods) {
      for (const activity of store.promotionGoodsList) {
        for (const goods of activity.goodsPromotionList) {
          if (goods.spuId === spuId && goods.skuId === skuId) {
            currentStore = store;
            currentActivity = currentActivity;
            currentGoods = goods;
            return {
              currentStore,
              currentActivity,
              currentGoods,
            };
          }
        }
      }
    }
    return {
      currentStore,
      currentActivity,
      currentGoods,
    };
  },

  // 注：实际场景时应该调用接口获取购物车数据
  getCartGroupData() {
    return fetchCartGroupData();
  },

  // 选择单个商品
  selectGoodsService({ spuId, skuId, isSelected }) {
    return updateCartItemSelection(skuId, isSelected);
  },

  // 全选门店
  selectStoreService({ storeId, isSelected }) {
    // Assuming single store for now, or I can use selectAllCartItems
    return selectAllCartItems(isSelected);
  },

  // 加购数量变更
  changeQuantityService({ spuId, skuId, quantity }) {
    return updateCartItemQuantity(skuId, quantity);
  },

  // 删除加购商品
  deleteGoodsService({ spuId, skuId }) {
    return deleteCartItem(skuId);
  },

  // 清空失效商品
  clearInvalidGoodsService() {
    this.data.cartGroupData.invalidGoodItems = [];
    return Promise.resolve();
  },

  onGoodsSelect(e) {
    const {
      goods: { spuId, skuId },
      isSelected,
    } = e.detail;
    const { currentGoods } = this.findGoods(spuId, skuId);
    Toast({
      context: this,
      selector: '#t-toast',
      message: `${isSelected ? '选择' : '取消'}"${
        currentGoods.title.length > 5 ? `${currentGoods.title.slice(0, 5)}...` : currentGoods.title
      }"`,
      icon: '',
    });
    this.selectGoodsService({ spuId, skuId, isSelected }).then(() => this.refreshData());
  },

  onStoreSelect(e) {
    const {
      store: { storeId },
      isSelected,
    } = e.detail;
    this.selectStoreService({ storeId, isSelected }).then(() => this.refreshData());
  },

  onQuantityChange(e) {
    const {
      goods: { spuId, skuId },
      quantity,
    } = e.detail;
    const { currentGoods } = this.findGoods(spuId, skuId);
    const stockQuantity = currentGoods.stockQuantity > 0 ? currentGoods.stockQuantity : 0; // 避免后端返回的是-1
    // 加购数量超过库存数量
    if (quantity > stockQuantity) {
      // 加购数量等于库存数量的情况下继续加购
      if (currentGoods.quantity === stockQuantity && quantity - stockQuantity === 1) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '当前商品库存不足',
        });
        return;
      }
      Dialog.confirm({
        title: '商品库存不足',
        content: `当前商品库存不足，最大可购买数量为${stockQuantity}件`,
        confirmBtn: '修改为最大可购买数量',
        cancelBtn: '取消',
      })
        .then(() => {
          this.changeQuantityService({
            spuId,
            skuId,
            quantity: stockQuantity,
          }).then(() => this.refreshData());
        })
        .catch(() => {});
      return;
    }
    this.changeQuantityService({ spuId, skuId, quantity }).then(() => this.refreshData());
  },

  goCollect() {
    /** 活动肯定有一个活动ID，用来获取活动banner，活动商品列表等 */
    const promotionID = '123';
    wx.navigateTo({
      url: `/pages/promotion/promotion-detail/index?promotion_id=${promotionID}`,
    });
  },

  goGoodsDetail(e) {
    const { spuId, storeId } = e.detail.goods;
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}&storeId=${storeId}`,
    });
  },

  clearInvalidGoods() {
    // 实际场景时应该调用接口清空失效商品
    this.clearInvalidGoodsService().then(() => this.refreshData());
  },

  onGoodsDelete(e) {
    const {
      goods: { spuId, skuId },
    } = e.detail;
    Dialog.confirm({
      content: '确认删除该商品吗?',
      confirmBtn: '确定',
      cancelBtn: '取消',
    }).then(() => {
      this.deleteGoodsService({ spuId, skuId }).then(() => {
        Toast({ context: this, selector: '#t-toast', message: '商品删除成功' });
        this.refreshData();
      });
    });
  },

  onSelectAll(event) {
    const { isAllSelected } = event?.detail ?? {};
    Toast({
      context: this,
      selector: '#t-toast',
      message: `${!isAllSelected ? '全选' : '取消全选'}`,
    });
    // 调用接口改变全选
    selectAllCartItems(!isAllSelected).then(() => this.refreshData());
  },

  onToSettle() {
    const goodsRequestList = [];
    this.data.cartGroupData.storeGoods.forEach((store) => {
      store.promotionGoodsList.forEach((promotion) => {
        promotion.goodsPromotionList.forEach((m) => {
          if (m.isSelected == 1) {
            goodsRequestList.push(m);
          }
        });
      });
    });
    wx.setStorageSync('order.goodsRequestList', JSON.stringify(goodsRequestList));
    wx.navigateTo({ url: '/pages/order/order-confirm/index?type=cart' });
  },
  onGotoHome() {
    wx.switchTab({ url: '/pages/home/home' });
  },

  // 切换编辑模式
  onToggleEditMode() {
    this.setData({
      isEditMode: !this.data.isEditMode,
    });
  },

  // 批量删除选中的商品
  onBatchDelete() {
    const selectedGoods = [];
    this.data.cartGroupData.storeGoods.forEach((store) => {
      store.promotionGoodsList.forEach((promotion) => {
        promotion.goodsPromotionList.forEach((goods) => {
          if (goods.isSelected) {
            selectedGoods.push(goods);
          }
        });
      });
    });

    if (selectedGoods.length === 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择要删除的商品',
      });
      return;
    }

    Dialog.confirm({
      content: `确认删除选中的${selectedGoods.length}件商品吗?`,
      confirmBtn: '确定',
      cancelBtn: '取消',
    }).then(() => {
      const deletePromises = selectedGoods.map((goods) =>
        this.deleteGoodsService({ spuId: goods.spuId, skuId: goods.skuId })
      );
      Promise.all(deletePromises).then(() => {
        Toast({ context: this, selector: '#t-toast', message: '删除成功' });
        this.setData({ isEditMode: false });
        this.refreshData();
      });
    });
  },
});
