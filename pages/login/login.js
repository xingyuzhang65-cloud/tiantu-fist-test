Page({
  data: {
    account: '',
    password: ''
  },

  // 输入账号
  inputAccount(e) {
    this.setData({
      account: e.detail.value
    });
  },

  // 输入密码
  inputPassword(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 登录
  login() {
    const { account, password } = this.data;
    
    // 简单的账号密码验证（实际项目中应该调用后端API）
    if (account === 'customer' && password === '123456') {
      // 登录成功，保存用户信息和角色
      wx.setStorageSync('userInfo', { account });
      wx.setStorageSync('role', 'customer');
      
      // 跳转到客户页面
      wx.switchTab({
        url: '../customer/customer'
      });
    } else {
      wx.showToast({
        title: '账号或密码错误',
        icon: 'none'
      });
    }
  }
});