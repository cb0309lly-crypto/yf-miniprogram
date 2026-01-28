import { fetchPerson } from '../../../services/usercenter/fetchPerson';
import { updatePerson } from '../../../services/usercenter/updatePerson';
import { phoneEncryption } from '../../../utils/util';
import { config } from '../../../config/index';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    personInfo: {
      avatarUrl: '',
      nickName: '',
      gender: 0,
      phoneNumber: '',
    },
    showUnbindConfirm: false,
    pickerOptions: [
      {
        name: '男',
        code: '1',
      },
      {
        name: '女',
        code: '2',
      },
    ],
    typeVisible: false,
    genderMap: ['', '男', '女'],
  },
  onLoad() {
    this.init();
  },
  init() {
    this.fetchData();
  },
  fetchData() {
    fetchPerson().then((personInfo) => {
      this.setData({
        personInfo,
        'personInfo.phoneNumber': phoneEncryption(personInfo.phoneNumber),
      });
    });
  },
  onClickCell({ currentTarget }) {
    const { dataset } = currentTarget;
    const { nickName } = this.data.personInfo;

    switch (dataset.type) {
      case 'gender':
        this.setData({
          typeVisible: true,
        });
        break;
      case 'name':
        wx.navigateTo({
          url: `/pages/user/name-edit/index?name=${nickName}`,
        });
        break;
      case 'avatarUrl':
        this.toModifyAvatar();
        break;
      default: {
        break;
      }
    }
  },
  onClose() {
    this.setData({
      typeVisible: false,
    });
  },
  onConfirm(e) {
    const { value } = e.detail;
    this.setData(
      {
        typeVisible: false,
        'personInfo.gender': value,
      },
      () => {
        // 保存性别到服务器
        updatePerson({ gender: parseInt(value) })
          .then(() => {
            Toast({
              context: this,
              selector: '#t-toast',
              message: '设置成功',
              theme: 'success',
            });
          })
          .catch((err) => {
            console.error('更新性别失败:', err);
            Toast({
              context: this,
              selector: '#t-toast',
              message: '设置失败',
              theme: 'error',
            });
          });
      },
    );
  },
  async toModifyAvatar() {
    try {
      const tempFilePath = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            const { path, size } = res.tempFiles[0];
            if (size <= 10485760) {
              resolve(path);
            } else {
              reject({ errMsg: '图片大小超出限制，请重新上传' });
            }
          },
          fail: (err) => reject(err),
        });
      });
      
      // 上传图片到服务器
      wx.showLoading({ title: '上传中...' });
      const uploadRes = await new Promise((resolve, reject) => {
        const token = wx.getStorageSync('access_token');
        wx.uploadFile({
          url: `${config.apiBaseUrl}/upload/image`,
          filePath: tempFilePath,
          name: 'file',
          header: {
            Authorization: `Bearer ${token}`,
          },
          success: (res) => {
            const data = JSON.parse(res.data);
            if (data.code === 0 && data.data) {
              resolve(data.data.url);
            } else if (data.url) {
              // 兼容直接返回url的情况
              resolve(data.url);
            } else {
              reject({ errMsg: data.msg || '上传失败' });
            }
          },
          fail: (err) => reject(err),
        });
      });

      // 更新头像到服务器
      await updatePerson({ avatarUrl: uploadRes });
      
      this.setData({
        'personInfo.avatarUrl': uploadRes,
      });
      
      wx.hideLoading();
      Toast({
        context: this,
        selector: '#t-toast',
        message: '头像修改成功',
        theme: 'success',
      });
    } catch (error) {
      wx.hideLoading();
      if (error.errMsg === 'chooseImage:fail cancel') return;
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.errMsg || error.msg || '修改头像出错了',
        theme: 'error',
      });
    }
  },
});
