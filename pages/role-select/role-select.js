Page({
  data: {
    // 页面数据
  },

  // 选择角色
  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    
    if (role === 'driver') {
      // 司机角色，直接跳转到授权登录
      this.authorizeDriver();
    } else if (role === 'customer') {
      // 客户角色，跳转到登录页面
      wx.navigateTo({
        url: '../login/login'
      });
    }
  },

  // 司机授权登录
  authorizeDriver() {
    wx.getUserProfile({
      desc: '用于登录小程序',
      success: (res) => {
        // 保存用户信息到本地存储
        wx.setStorageSync('userInfo', res.userInfo);
        wx.setStorageSync('role', 'driver');
        
        // 跳转到司机页面
        wx.switchTab({
          url: '../driver/driver'
        });
      },
      fail: (err) => {
        console.log('授权失败:', err);
        wx.showToast({
          title: '授权失败，请重新尝试',
          icon: 'none'
        });
      }
    });
  }
});