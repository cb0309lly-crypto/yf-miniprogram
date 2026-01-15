import { config, cdnBase } from '../../config/index';
import request from '../../utils/request';

/** 获取首页数据 */
function mockFetchHome() {
  const { delay } = require('../_utils/delay');
  const { genSwiperImageList } = require('../../model/swiper');
  return delay().then(() => {
    return {
      swiper: genSwiperImageList(),
      tabList: [
        {
          text: '精选推荐',
          key: 0,
        },
        {
          text: '夏日防晒',
          key: 1,
        },
        {
          text: '二胎大作战',
          key: 2,
        },
        {
          text: '人气榜',
          key: 3,
        },
        {
          text: '好评榜',
          key: 4,
        },
        {
          text: 'RTX 30',
          key: 5,
        },
        {
          text: '手机也疯狂',
          key: 6,
        },
      ],
      activityImg: `${cdnBase}/activity/banner.png`,
    };
  });
}

/** 获取首页数据 */
export function fetchHome() {
  if (config.useMock) {
    return mockFetchHome();
  }
  return request({
    url: '/stats/card-data', // 或者首页专用的聚合接口
    method: 'GET',
  }).then(res => {
    // 这里可以根据实际后端返回格式进行转换
    return mockFetchHome(); // 暂时回退到 mock 以保证 UI 正常，联调时再替换
  });
}
