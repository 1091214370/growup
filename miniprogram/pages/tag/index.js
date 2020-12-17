// pages/tag/index.js
const app = getApp();
let db = wx.cloud.database();
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tags:[],
    allColors: [
      'rgb(130,57,53)',
      'rgb(137,190,178)',
      'rgb(201,186,131)',
      'rgb(222,211,140)',
      'rgb(222,156,83)',
      'rgb(159,125,80)',
      'rgb(17,63,61)',
      'rgb(60,79,57)',
      'rgb(98,92,51)',
      'rgb(179,214,110)',
    ],
    visable: false,
    buttons: [{text: '取消'}, {text: '新增'}],
    inputValue: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData(app.globalData.openid);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  getData: function(user_id) {
    const that = this;
    if (!db) {
      db = wx.cloud.database();
    }
    if (user_id) {
      console.log('开始查询数据', !!user_id)
      db.collection('user-main').where({
        userId: user_id
      }).get({
        success: function(res) {
          console.log('查询完成', res)
        that.setData({
          tags: res.data[0].userTag || [],
        });
      },
      fail: function(err) {
        console.log('数据库查询失败哦', err);
        that.setData({
          tags: [],
        });
      }
      })
    }
  },
  addTag: function(e) {
    if (e.detail.index) {
      const { inputValue, allColors, tags } = this.data;
      if (inputValue && inputValue.length) {
        console.log('开始保存数据')
        db.collection('user-main').where({
          userId: app.globalData.openid,
        })
        .update({
          data: {
            userTag: _.push({
              visable: true,
              color: allColors[tags.length + 1],
              tag_name: inputValue,
              tag_id: `tag_${new Date().getTime()}`,
              allTimes: [],
              updateTime: new Date(),
              creatTime: new Date(),
            })
          },
        })
        .then(res => {
          console.log('保存完成')
          this.setData({ visable: false, inputValue: '' });
          this.getData(app.globalData.openid)
        })
        .catch(err => console.log('添加标签出错', err))
      }
    } else {
      this.setData({ visable: false, inputValue: '' });
    }
  },
  openModal: function() {
    this.setData({ visable: true });
  },
  bindKeyInput: function (e) {
    this.setData({ inputValue: e.detail.value });
  },
})