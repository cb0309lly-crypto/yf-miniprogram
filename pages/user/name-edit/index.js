import { updatePerson } from '../../../services/usercenter/updatePerson';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    nameValue: '',
  },
  onLoad(options) {
    const { name } = options;
    this.setData({
      nameValue: name,
    });
  },
  onSubmit() {
    const { nameValue } = this.data;
    if (!nameValue || nameValue.length > 15) {
      wx.showToast({
        title: '昵称长度不符合要求',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    updatePerson({ nickName: nameValue })
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon: 'success',
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      })
      .catch((err) => {
        console.error('更新昵称失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '保存失败',
          icon: 'error',
        });
      });
  },
  clearContent() {
    this.setData({
      nameValue: '',
    });
  },
});
