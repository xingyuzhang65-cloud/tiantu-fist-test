Page({
  data: {
    userInfo: {},
    queueList: [
      { name: '客户A', number: '001', status: '等待中' },
      { name: '客户B', number: '002', status: '处理中' },
      { name: '客户C', number: '003', status: '等待中' }
    ]
  },

  onLoad() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo
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