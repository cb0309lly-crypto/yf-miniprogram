import { fetchUserCenter } from '../../services/usercenter/fetchUsercenter';
import Toast from 'tdesign-miniprogram/toast/index';
import { isLoggedIn, checkLogin, getUserInfo as getStoredUserInfo } from '../../utils/auth';

const menuData = [
  [
    {
      title: '收货地址',
      tit: '',
      url: '',
      type: 'address',
    },
  ],
];

const orderTagInfos = [
  {
    title: '待付款',
    iconName: 'wallet',
    orderNum: 0,
    tabType: 5,
    status: 1,
  },
  {
    title: '待发货',
    iconName: 'deliver',
    orderNum: 0,
    tabType: 10,
    status: 1,
  },
  {
    title: '待收货',
    iconName: 'package',
    orderNum: 0,
    tabType: 40,
    status: 1,
  },
  {
    title: '待评价',
    iconName: 'comment',
    orderNum: 0,
    tabType: 60,
    status: 1,
  },
  {
    title: '退款/售后',
    iconName: 'exchang',
    orderNum: 0,
    tabType: 0,
    status: 1,
  },
];

const getDefaultData = () => ({
  showMakePhone: false,
  isLoggedIn: false,
  userInfo: {
    avatarUrl: '',
    nickName: '点击登录',
    phoneNumber: '',
  },
  menuData,
  orderTagInfos,
  customerServiceInfo: {},
  currAuthStep: 1,
  showKefu: true,
  versionNo: '',
});

Page({
  data: getDefaultData(),

  onLoad() {
    this.getVersionInfo();
  },

  onShow() {
    this.getTabBar().init();
    this.checkLoginStatus();
    this.init();
  },
  
  onPullDownRefresh() {
    this.init();
  },

  checkLoginStatus() {
    const loggedIn = isLoggedIn();
    this.setData({
      isLoggedIn: loggedIn
    });

    if (loggedIn) {
      // 已登录，尝试从缓存获取用户信息
      const cachedUserInfo = getStoredUserInfo();
      if (cachedUserInfo) {
        this.setData({
          userInfo: cachedUserInfo,
          currAuthStep: 2
        });
      }
    } else {
      // 未登录，显示默认状态
      this.setData({
        userInfo: {
          avatarUrl: '',
          nickName: '点击登录',
          phoneNumber: '',
        },
        currAuthStep: 1
      });
    }
  },

  init() {
    if (isLoggedIn()) {
      this.fetUseriInfoHandle();
    }
  },

  fetUseriInfoHandle() {
    fetchUserCenter().then(({ userInfo, countsData, orderTagInfos: orderInfo, customerServiceInfo }) => {
      // eslint-disable-next-line no-unused-expressions
      menuData?.[0].forEach((v) => {
        countsData.forEach((counts) => {
          if (counts.type === v.type) {
            // eslint-disable-next-line no-param-reassign
            v.tit = counts.num;
          }
        });
      });
      const info = orderTagInfos.map((v, index) => ({
        ...v,
        ...orderInfo[index],
      }));
      this.setData({
        userInfo,
        menuData,
        orderTagInfos: info,
        customerServiceInfo,
        currAuthStep: 2,
        isLoggedIn: true
      });
      wx.stopPullDownRefresh();
    }).catch((err) => {
      // 处理 401 错误
      if (err.needLogin) {
        this.setData({
          isLoggedIn: false,
          currAuthStep: 1,
          userInfo: {
            avatarUrl: '',
            nickName: '点击登录',
            phoneNumber: '',
          }
        });
      }
      wx.stopPullDownRefresh();
    });
  },

  onClickCell({ currentTarget }) {
    const { type } = currentTarget.dataset;

    switch (type) {
      case 'address': {
        // 需要登录才能查看地址
        checkLogin({
          success: () => {
            wx.navigateTo({ url: '/pages/user/address/list/index' });
          }
        });
        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  jumpNav(e) {
    const status = e.detail.tabType;

    // 需要登录才能查看订单
    checkLogin({
      success: () => {
        if (status === 0) {
          wx.navigateTo({ url: '/pages/order/after-service-list/index' });
        } else {
          wx.navigateTo({ url: `/pages/order/order-list/index?status=${status}` });
        }
      }
    });
  },

  jumpAllOrder() {
    // 需要登录才能查看订单
    checkLogin({
      success: () => {
        wx.navigateTo({ url: '/pages/order/order-list/index' });
      }
    });
  },

  openMakePhone() {
    this.setData({ showMakePhone: true });
  },

  closeMakePhone() {
    this.setData({ showMakePhone: false });
  },

  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.customerServiceInfo.servicePhone,
    });
  },

  gotoUserEditPage() {
    const { currAuthStep, isLoggedIn } = this.data;
    
    if (!isLoggedIn) {
      // 未登录，跳转到登录页
      wx.navigateTo({ url: '/pages/login/index' });
      return;
    }
    
    if (currAuthStep === 2) {
      wx.navigateTo({ url: '/pages/user/person-info/index' });
    } else {
      this.fetUseriInfoHandle();
    }
  },

  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const { version, envVersion = __wxConfig } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },
});
