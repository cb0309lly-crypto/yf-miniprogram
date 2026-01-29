import updateManager from './common/updateManager';

App({
  onLaunch: function () {
    // 移除强制登录逻辑，允许用户在未登录状态下浏览商品
    // 登录检查将在具体需要登录的操作中进行
    console.log('小程序启动');
    
    // 可选：静默检查登录状态，但不强制跳转
    const token = wx.getStorageSync('access_token');
    if (token) {
      console.log('用户已登录');
    } else {
      console.log('用户未登录，可以浏览商品');
    }
  },
  onShow: function () {
    updateManager();
  },
});
