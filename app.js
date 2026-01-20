import updateManager from './common/updateManager';

App({
  onLaunch: function () {
    const token = wx.getStorageSync('access_token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/index',
      });
    }
  },
  onShow: function () {
    updateManager();
  },
});
