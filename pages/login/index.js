import request from '../../utils/request';

Page({
  onLoad() {
    // 移除自动跳转逻辑，允许用户主动选择登录
    // 检测是否已有 access_token，如果有则根据重定向地址跳转
    const token = wx.getStorageSync('access_token');
    if (token) {
      this.redirectAfterLogin();
    }
  },

  handleLogin() {
    wx.showLoading({ title: '登录中...' });
    
    // 先获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        const { nickName, avatarUrl } = profileRes.userInfo;
        
        // 再进行登录
        wx.login({
          success: (res) => {
            if (res.code) {
              // 调用后端 wxlogin，传递用户信息
              request({
                url: '/auth/wxlogin',
                method: 'POST',
                data: {
                  code: res.code,
                  nickname: nickName,
                  avatar: avatarUrl,
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
                      this.redirectAfterLogin();
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
      fail: (err) => {
        console.error('getUserProfile fail:', err);
        wx.hideLoading();
        wx.showToast({ title: '获取用户信息失败', icon: 'none' });
      },
    });
  },

  /**
   * 登录成功后的重定向逻辑
   */
  redirectAfterLogin() {
    // 获取登录前保存的页面地址
    const redirectUrl = wx.getStorageSync('login_redirect_url');
    
    // 清除重定向地址
    wx.removeStorageSync('login_redirect_url');
    
    if (redirectUrl) {
      // 判断是否是 tabBar 页面
      const tabBarPages = [
        '/pages/home/home',
        '/pages/category/index',
        '/pages/cart/index',
        '/pages/usercenter/index'
      ];
      
      const isTabBar = tabBarPages.some(page => redirectUrl.startsWith(page));
      
      if (isTabBar) {
        // TabBar 页面使用 switchTab
        wx.switchTab({ 
          url: redirectUrl.split('?')[0],
          fail: () => {
            // 如果跳转失败，返回首页
            wx.switchTab({ url: '/pages/home/home' });
          }
        });
      } else {
        // 非 TabBar 页面使用 redirectTo
        wx.redirectTo({
          url: redirectUrl,
          fail: () => {
            // 如果跳转失败，尝试返回上一页
            wx.navigateBack({
              fail: () => {
                // 如果没有上一页，跳转到首页
                wx.switchTab({ url: '/pages/home/home' });
              }
            });
          }
        });
      }
    } else {
      // 没有重定向地址，检查页面栈
      const pages = getCurrentPages();
      if (pages.length > 1) {
        // 有上一页，返回上一页
        wx.navigateBack();
      } else {
        // 没有上一页，跳转到首页
        wx.switchTab({ url: '/pages/home/home' });
      }
    }
  },

  /**
   * 跳过登录，返回首页
   */
  skipLogin() {
    wx.switchTab({ url: '/pages/home/home' });
  }
});
