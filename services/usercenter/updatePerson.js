import request from '../../utils/request';

/** 更新个人信息 */
export function updatePerson(data) {
  return request({
    url: '/auth/user_info',
    method: 'PUT',
    data,
  });
}
