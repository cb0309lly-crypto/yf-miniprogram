import { config } from '../config/index';

const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data = {}, header = {} } = options;
    
    // 获取存储的 token
    const token = wx.getStorageSync('access_token');
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: `${config.apiBaseUrl}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token 过期或未授权
          wx.removeStorageSync('access_token');
          wx.removeStorageSync('userInfo');
          
          // 不直接跳转，而是返回错误信息，由调用方决定如何处理
          const error = {
            statusCode: 401,
            message: '登录已过期，请重新登录',
            needLogin: true,
            data: res.data
          };
          reject(error);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export default request;






