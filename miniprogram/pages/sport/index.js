import * as echarts from '../../components/ec-canvas/echarts';
//index.js

Page({
  data: {
    requestResult: '',
    runTotal: [],
    todayData: 0,
    ec: {
      lazyLoad: true,
    }
  },

  onLoad: function() {
    const that = this;
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../authentic/index',
      })
      return
    }
    // 获取用户信息
    that.onGetRunData();
  },

  // 获取微信步数
  onGetRunData: function() {
    wx.showLoading({
      title: '加载中',
    })
    this.ecLine =this.selectComponent('#mychart-line');
    this.ecBar =this.selectComponent('#mychart-bar');
    wx.getWeRunData({
      success: (result) => {
        wx.cloud.callFunction({
          name: 'getRunData',
          data: {
            weRunData: wx.cloud.CloudID(result.cloudID),
          }
        }).then(res => {
          const xData = [];
          const yData = [];
          const xSortData = [];
          const ySortData = [];
          let runTotal = 0;
          let data = res.result.event.weRunData.data.stepInfoList || [];
          const sortData = data.concat().sort((a, b) => a.step - b.step).splice(20,30);
          for (let i in data) { // 运动趋势折线图
            runTotal += data[i].step;
            xData.push(new  Date(Number(data[i].timestamp) * 1000).toLocaleString()
              .split(' ')[0].substring(5));
            yData.push(data[i].step);
          }
          for (let s in sortData) { // 步数排行
            xSortData.push(new  Date(Number(sortData[s].timestamp) * 1000).toLocaleString()
              .split(' ')[0].substring(5));
            ySortData.push(sortData[s].step);
          }

          this.initChart(xData, yData, xSortData, ySortData);
          this.setData({
            xData,
            yData,
            runTotal,
            xSortData,
            ySortData,
            todayData: data[data.length -1].step,
          })
          wx.hideLoading();
        }).catch(e => {
          wx.hideLoading();
          console.error('获取微信步数云函数报错', e);
        })
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取微信步数失败', err);
      }
    })
  },
  /**设置图表映射 */
  initChart: function(xData, yData, xSortData, ySortData) {
    const optionLine = {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xData,
      },
      yAxis: {
        type: 'value',
        name: '步',
      },
      series: [{
        data: yData,
        type: 'line',
        itemStyle: {
          borderColor: '#FF8C00',
        },
        lineStyle: {
          color: '#FF8C00',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1.2,
            colorStops: [{
              offset: 0, color: '#FFA500' // 0% 处的颜色
            }, {
                offset: 1, color: '#fff' // 100% 处的颜色
            }],
          }
        },
      }]
    };
    const optionBar = {
      grid: {
        left: '3%',
        right: '10%',
        bottom: '3%',
        containLabel: true
      },
      yAxis: {
        data: xSortData,
        type: 'category',
        name: '日期',
      },
      xAxis: {
        type: 'value',
        name: '步',
        boundaryGap: [0, 0.01],
      },
      series: [{
        data: ySortData,
        type: 'bar',
        label: {
          show: true,
          position: 'right',
        },
        itemStyle: {
          color: '#FF8C00',
          barBorderRadius: [0, 25, 25, 0] //（顺时针左上，右上，右下，左下）
        },
      }]
    };
    //echarts会继承父元素的宽高,所以我们一定要设置echarts组件父元素的高度。
    this.ecLine.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: 2,
      });
      //给echarts 设置数据及配置项（图表类型、数据量等）
      chart.setOption(optionLine);
      return chart;
    });
    this.ecBar.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: 2,
      });
      //给echarts 设置数据及配置项（图表类型、数据量等）
      chart.setOption(optionBar);
      return chart;
    });
  },
})