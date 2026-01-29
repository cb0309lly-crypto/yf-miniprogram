/**
 * 登录认证工具函数
 * 用于统一管理小程序的登录状态检查和跳转逻辑
 */

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  const token = wx.getStorageSync('access_token');
  return !!token;
}

/**
 * 获取当前页面的完整路径（包含参数）
 * @returns {string} 完整的页面路径
 */
function getCurrentPageUrl() {
  const pages = getCurrentPages();
  if (pages.length === 0) {
    return '/pages/home/home';
  }
  
  const currentPage = pages[pages.length - 1];
  const url = `/${currentPage.route}`;
  const options = currentPage.options;
  
  // 构建完整的页面路径（包含参数）
  if (options && Object.keys(options).length > 0) {
    const params = Object.keys(options)
      .map(key => `${key}=${options[key]}`)
      .join('&');
    return `${url}?${params}`;
  }
  
  return url;
}

/**
 * 检查登录状态，未登录则跳转登录页
 * @param {Object} options 配置项
 * @param {string} options.redirectUrl 登录成功后的跳转地址（可选，默认为当前页面）
 * @param {Function} options.success 已登录时的回调
 * @param {Function} options.fail 未登录时的回调（可选）
 * @returns {boolean} 是否已登录
 */
export function checkLogin(options = {}) {
  const { redirectUrl, success, fail } = options;
  
  if (isLoggedIn()) {
    // 已登录，执行成功回调
    success && success();
    return true;
  } else {
    // 未登录，保存当前页面信息并跳转登录页
    const saveUrl = redirectUrl || getCurrentPageUrl();
    
    // 保存重定向地址
    wx.setStorageSync('login_redirect_url', saveUrl);
    
    // 执行失败回调
    fail && fail();
    
    // 跳转到登录页
    wx.navigateTo({
      url: '/pages/login/index',
      fail: (err) => {
        // 如果当前已经在登录页，则不跳转
        console.log('Navigate to login page failed:', err);
      }
    });
    
    return false;
  }
}

/**
 * 需要登录才能执行的操作包装器
 * 使用示例：
 * const protectedFunc = requireLogin(function() {
 *   // 需要登录后才能执行的代码
 * });
 * protectedFunc();
 * 
 * @param {Function} callback 需要登录后执行的回调函数
 * @param {Object} options 配置项
 * @returns {Function} 包装后的函数
 */
export function requireLogin(callback, options = {}) {
  return function(...args) {
    checkLogin({
      ...options,
      success: () => {
        callback.apply(this, args);
      }
    });
  };
}

/**
 * 显示登录提示弹窗
 * @param {Object} options 配置项
 * @param {string} options.title 提示标题
 * @param {string} options.content 提示内容
 * @param {Function} options.confirm 确认后的回调
 * @param {Function} options.cancel 取消后的回调
 */
export function showLoginModal(options = {}) {
  const {
    title = '提示',
    content = '此操作需要登录，是否前往登录？',
    confirm,
    cancel
  } = options;
  
  wx.showModal({
    title,
    content,
    confirmText: '去登录',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        // 保存当前页面信息
        const currentUrl = getCurrentPageUrl();
        wx.setStorageSync('login_redirect_url', currentUrl);
        
        // 跳转登录页
        wx.navigateTo({
          url: '/pages/login/index'
        });
        
        confirm && confirm();
      } else if (res.cancel) {
        cancel && cancel();
      }
    }
  });
}

/**
 * 清除登录信息
 */
export function clearLoginInfo() {
  wx.removeStorageSync('access_token');
  wx.removeStorageSync('userInfo');
  wx.removeStorageSync('login_redirect_url');
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息对象，未登录返回 null
 */
export function getUserInfo() {
  if (!isLoggedIn()) {
    return null;
  }
  
  try {
    const userInfo = wx.getStorageSync('userInfo');
    return userInfo || null;
  } catch (e) {
    console.error('Get user info error:', e);
    return null;
  }
}

/**
 * 保存用户信息
 * @param {Object} userInfo 用户信息对象
 */
export function saveUserInfo(userInfo) {
  try {
    wx.setStorageSync('userInfo', userInfo);
  } catch (e) {
    console.error('Save user info error:', e);
  }
}

/**
 * 保存登录令牌
 * @param {string} token 访问令牌
 */
export function saveToken(token) {
  try {
    wx.setStorageSync('access_token', token);
  } catch (e) {
    console.error('Save token error:', e);
  }
}

/**
 * 获取登录令牌
 * @returns {string|null} 访问令牌，未登录返回 null
 */
export function getToken() {
  try {
    return wx.getStorageSync('access_token') || null;
  } catch (e) {
    console.error('Get token error:', e);
    return null;
  }
}
