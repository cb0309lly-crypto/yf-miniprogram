import request from '../../utils/request';

Page({
  onLoad() {
    // 检测是否已有 access_token，如果有则直接进入主页
    const token = wx.getStorageSync('access_token');
    if (token) {
      wx.reLaunch({ url: '/pages/home/home' });
    }
  },

  handleLogin() {
    wx.showLoading({ title: '登录中...' });
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用后端 wxlogin
          request({
            url: '/auth/wxlogin',
            method: 'POST',
            data: {
              code: res.code,
            },
          })
            .then((loginRes) => {
              console.log('wxlogin response:', loginRes);
              // 适配后端返回结构 { code: 0, data: { access_token, user }, msg: 'success' }
              if (loginRes.code === 0 && loginRes.data && loginRes.data.access_token) {
                const { access_token, user } = loginRes.data;
                wx.setStorageSync('access_token', access_token);
                if (user) {
                  wx.setStorageSync('userInfo', user);
                }

                wx.hideLoading();
                wx.showToast({ title: '登录成功' });

                // 延迟跳转
                setTimeout(() => {
                  const pages = getCurrentPages();
                  if (pages.length > 1) {
                    wx.navigateBack();
                  } else {
                    wx.reLaunch({ url: '/pages/home/home' });
                  }
                }, 1000);
              } else {
                throw new Error(loginRes.msg || '登录返回异常');
              }
            })
            .catch((error) => {
              console.error('Login error:', error);
              wx.hideLoading();
              wx.showToast({ title: error.message || '登录失败', icon: 'none' });
            });
        } else {
          wx.hideLoading();
          wx.showToast({ title: '获取code失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('wx.login fail:', err);
        wx.hideLoading();
        wx.showToast({ title: '启动登录失败', icon: 'none' });
      },
    });
  },
});
