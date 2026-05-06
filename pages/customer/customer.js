Page({
  data: {
    userInfo: {},
    orderList: [
      { id: '202401010001', time: '2024-01-01 10:00', status: '已完成' },
      { id: '202401020002', time: '2024-01-02 14:30', status: '处理中' },
      { id: '202401030003', time: '2024-01-03 09:15', status: '待处理' }
    ]
  },

  onLoad() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo
    });
  },

  // 导航到功能页面
  navigateTo() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('role');
          
          // 跳转到角色选择页面
          wx.reLaunch({
            url: '../role-select/role-select'
          });
        }
      }
    });
  }
});