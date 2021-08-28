// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stores: [], // 附近门店
    GDKey: '', //高德key
    showAll: false, // 查看全部门店
    resultEat: '', // 随机结果
    resultObj:{}, // 随机结果
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.handleGeo(); // 经纬度
    this.handleGDKey(); // 高德key
  },
  /**
   * 获取高德key
   */
  handleGDKey() {
    this.setData({
      GDKey:  '2c6a627756c6dd06e8e07c035097bdac'
    });
  },
  /**
   * 根据坐标获取附近3公里吃吃喝喝
   */
  handleEatWhat() {
    wx.showLoading();
    const { GDKey, location } = this.data;
    if (!GDKey || !location) {
      wx.showToast({
        title: '系统异常',
      });
    }
    const that = this;
    // 获取附近门店数据
    wx.request({
      url: 'https://restapi.amap.com/v3/place/around',
      data: {
        key: GDKey,
        location,
        types:'050100'
      },
      timeout: 10000,
      success(res) {
        const result = res && res.data ? res.data.pois || [] : [];
        console.log('res===================>, ', res, result);
        that.setData({
          stores: result,
          resultEat: ''
        }, ()=> that.handleResultEat(result));
        wx.hideLoading();
      },
      fail(err) {
        console.log('err=====================>', err)
        wx.showToast({
          title: '获取附近数据失败',
        });
        wx.hideLoading();
      }
    })
  },
      /**
   * 获取定位授权
   */
  handleGeo() {
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy: true,
      success (res) {
        const latitude = res.latitude
        const longitude = res.longitude
        that.setData({
          location: `${longitude},${latitude}`
        });
      }
      })
  },
  /**
   * 展示附近信息
   */
  handleShowAll() {
    this.setData({
      showAll: true
    })
  },
  /**
   * 随机选一家门店
   * @param {*} stores 
   */
  handleResultEat(stores) {
    if (stores.length) {
      const random = Math.round(Math.random() * stores.length);
      console.log('===========>', random, stores[random])
      const res = stores[random];
      const resName = res.name;
      this.setData({
        resultEat: resName,
        resultObj: res,
      })

    }
  }
})