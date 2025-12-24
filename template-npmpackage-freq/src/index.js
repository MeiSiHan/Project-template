import {
  deepMerge,
  deepCopy,
  calculateStepValues,
  calculateWidths,
  truncateNumber,
  colorTostring,
  canMergeVerticallys
} from './utils'





/**
 * freqChart 频率分布图控件
 *
 * @class freqChart
 */
class freqChart {
  constructor(id, options, treedata) {
    this._isMyClassInstance = true; // 添加标志
    // this.devicePixelRatio = window.devicePixelRatio || 1;
    this.devicePixelRatio = 1;
    //this.loadOptions = options;
    this.box = document.getElementById(id);
    //this.box.style.position = "relative"
    // this.box.innerHTML = '';
    var canvasEls = document.querySelectorAll('canvas')
    for (let ids = 0; ids < canvasEls.length; ids++) {
      canvasEls[ids].remove()
    }
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = "absolute";
    this.box.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = true; // 启用抗锯齿
    //按键容器
    this.bottomBox = document.getElementById('bottomBox');
    this.bottomBox.style.display = "flex"; // 显示
    //遮罩
    this.lockBox = document.getElementById('lock_mask');
    //加载进度
    this.loadMask = document.getElementById('onload_mask');
    //滚动条
    this.scrollBar=document.getElementById('scroll-bar');
    this.scrollBarContent=document.getElementById('scroll-bar-content');
    this.scrollBar.style.display = "none"; // 隐藏
    this.gridbackground="#fff"
    //分布图数据
    this.treeData = [];

    this.onFreqChangeCallback = null; //频率改变回调函数
    this.callbackFreq = { //*频率回调函数*/
      min: 0,
      max: 0
    }
    this.onClickGridCallback = null; //点击网格回调函数
    this.onKeyCallback = null; //控制按钮回调函数
    this.onClickZommCallback = null; //点击缩放按钮回调函数
    this.onFocusCallback = null; //控件焦点回调消息
    this.onSwitchCallback = null; //点击切换按钮
    this.zoomStatus = 1

    this.chartWidth = 0; //图表宽度
    this.chartHeight = 0; //图表高度
    this.xLabelGridInfo = [] //x轴标签网格信息
    this.inittreeData = {}; //初始数据
    this.wifiMaxrows= 0; //类型2wifi 子信道最大行数
    //频率像素比
    this.freqPxStep = 0
    //当前视图频率差
    this.freqXDiff = 0
    //初始默认值
    this.initDefault();
    //初始化配置
    this.initOptions(options);

    if (treedata) {
      this.readJsonData(treedata)
    }
    //监听事件
    this.canvas.addEventListener('mousedown', this.mousedown.bind(this));
    this.canvas.addEventListener('mouseup', this.mouseup.bind(this))
    this.canvas.addEventListener('mousemove', this.throttle(this.mousemove.bind(this),50));
    this.canvas.addEventListener('mouseout', this.mouseout.bind(this))
    this.canvas.addEventListener('touchstart', this.touchstart.bind(this));
    this.canvas.addEventListener('touchmove', this.throttle(this.touchmove.bind(this),50))
    this.canvas.addEventListener('touchend', this.touchend.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDblClick.bind(this));
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    document.getElementById('zoom_in').addEventListener('click', (event) => {
      console.log("点击缩放了")
      this.showconsole("点击缩放了")
      event.preventDefault()
      this.setZomm(this.zoomStatus, event);
    }); //1.放大 2.缩小 
    // document.getElementById('zoom_out').addEventListener('click', this.setZomm.bind(this,2)); //缩小
    document.getElementById('switch_button').addEventListener('click', (event) => {
      event.preventDefault()
      this.showconsole("点击切换按钮")
      this.setSwitch(event);
    });
    this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    window.addEventListener('keydown', this.handleKeydown.bind(this));
    window.addEventListener('keyup', this.handleKeyup.bind(this));
    // 监听窗口调整大小
    window.addEventListener('resize', () => this.resizeCanvas());
    //window.addEventListener('resize', this.throttle(this.resizeCanvas().bind(this), 300));

    this.scrollBar.addEventListener('scroll', this.handleScroll.bind(this));
    this.scrollBar.addEventListener('mousedown', this.mousedownScroll.bind(this));
    this.scrollBar.addEventListener('touchstart', this.mousedownScroll.bind(this));
    this.scrollBar.addEventListener('mousemove', this.mousemoveScroll.bind(this));
    this.scrollBar.addEventListener('touchmove', this.mousemoveScroll.bind(this));
    this.scrollBar.addEventListener('mouseup', this.mouseupScroll.bind(this));
    this.scrollBar.addEventListener('touchend', this.mouseupScroll.bind(this));
    //清除焦点class active
    let eleactives = document.querySelectorAll('.active')
    for (let i = 0; i < eleactives.length; i++) {
      eleactives[i].classList.remove('active')
    }
    var buttonfocus = []
    if(this.options.button.show_zoom_button){
      buttonfocus.push({
        "type": "button",
        "key": 'zoomin',
        "column": 0,
        "row": 0
      })
    }
    if (this.options.button.show_switch_button) {
      var leng=buttonfocus.length
      buttonfocus.push({
        "type": "button",
        "key": 'switch',
        "column": 0,
        "row": leng
      })
    }
    console.log("初始按钮焦点",buttonfocus)
    // 焦点信息
    this.focusInfo = {
      isLock: false, //是否锁定
      focus: null, //当前焦点
      prefocus: null, //上一个焦点
      list: [buttonfocus]
    };

    //鼠标按下事件
    this.mousedownInfo = {
      isMouseDown: false,
      startX: 0,
      startY: 0,
      mouseupx: 0,
      mouseupy: 0,
      button: 0
    }
    //鼠标移动事件
    this.moveInfo = {
      isMove: false,
      preX: 0,
      preY: 0,
      moveX: 0,
      moveY: 0
    }
    //鼠标滚轮事件
    this.scrollBarInfo = {
      isMove:false, //是否拖动
    }
    this.drawChart()
  }

  /**
   * 初始默认参数
   */
  initDefault() {

    this.isDraw = true

    // 图像数据
    this.isDragging = false; //是否拖动
    this.isZooming = false; //是否缩放
    this.offsetX = 0; //x轴偏移量
    this.offsetY = 0; //y轴偏移量
    this.scaleX = 1; //x轴缩放比例
    this.scaleY = 1; //y轴缩放比例
    this.scaleDirection = "x"; // 缩放方向x|y|both
    this.selectedArea = null; //选中区域
    // 手指双指触摸操作
    this.touchStartDist = 0;
    //记录手指触摸信息
    this.touchStartInfo={
      start_freq:0,//触摸显示开始频率
      end_freq:0,//触摸显示结束频率
      touch_center_freq:0
    }

    this.prevTouchDistance = 0;
    this.isTouching = false;

    //移动
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isTouchDragging = false;
    this.lastTouchDistance = 0; // 上次两个触摸点之间的距离
    this.lastTouchCenterX = 0; // 上次两个触摸点的中心X坐标

    this.focusType = ""; //聚焦类型 grid|left|right|bottom|threshold|marker
    // this.updateScrollbar()
  }
  /**
   * 设置图表大小
   */
  setCanvasSize(widths, heights) {
    const width = widths || this.options.width;
    const height = heights || this.options.height;
    const containerWidth = this.box.clientWidth || 400;
    const containerHeight = this.box.clientHeight || 300;
    // 使用实际像素大小设置 Canvas
    this.canvas.width = width === "100%" ? containerWidth : width;
    this.canvas.height = height === "100%" ? containerHeight : height;

    // 设置 CSS 样式，确保 Canvas 在视觉上保持相应比例
    this.canvas.style.width = width === "100%" ? `${containerWidth}px` : `${width}px`;
    this.canvas.style.height = height === "100%" ? `${containerHeight}px` : `${height}px`;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    //计算图表宽高
    this.chartWidth = Math.floor(this.width - this.options.grid.left - this.options.grid.right)
    this.chartHeight = Math.floor(this.height - this.options.grid.top - this.options.grid.bottom)
    this.options.grid.right = this.width - this.options.grid.left - this.chartWidth;
    this.options.grid.bottom = this.height - this.options.grid.top - this.chartHeight;
    document.getElementById("bottomBox").style.height = this.height + "px";
    document.getElementById("bottomBox").style.width = this.options.grid.left + "px";


    this.scrollBar.style.top=this.options.grid.top+"px";
    this.scrollBar.style.right=this.options.grid.right+"px";
    this.scrollBar.style.height = this.chartHeight + "px";
    

    console.log("canvas宽高", this.canvas.width, this.canvas.height, "图表宽度", this.chartWidth);
    // 更新字体大小以适应高分辨率
    //this.options.fontSize = `${parseInt(this.options.fontSize) * window.devicePixelRatio}px`;
  }
  
  /**
   * 初始化配置
   * @param {*} options
   * @memberof freqChart
   */
  initOptions(options,types) {
    let defaultOptions = {
      "type": 1, //图表类型 1 2 3 4
      "width": "100%", //画布宽度
      "height": "100%", //画布高度
      "isPrint": false, //是否允许打印
      "background": "#fff", //背景色
      "language_code": 2052, //语言代码 2052中文 1033英文 0默认 1033
      "isreadfile": false, //是否读取文件
      "channel_show": "auto",//show 显示 hide 隐藏 auto 自动控件控制默认auto
      "scrollbar_show": "auto",//show 显示 hide 隐藏 auto 自动控件控制默认auto
      "grid": { //网格样式
        "left": 50, //左边距
        "top": 40, //上边距
        "bottom": 50, //下边距
        "right": 5, //右边距
        "track_gap": 0, //行间距
        "track_title_height": 30, //标题行高
        "track_min_height": 30, //行高
        "channel_max_height": 30, //信道道最大高度
        "track_grid_min_width": 30, //*最小网格宽度
        "stroke_color": [51, 51, 51, 1], //网格线颜色
        "stroke_width": 1, //网格线宽度
        "stroke_focus_width": 2, //网格线宽度
        "stroke_focus_color": [255, 0, 0, 1], //网格线颜色
        "width": 1, //网格线宽度
        "background": [255, 255, 255, 1], //背景色
      },
      "x_axis": { //X轴样式
        "decimals": "", //X轴刻度标签小数位数
        "unit": "", //单位MHz 为空不显示 
        "unit_right": 10, // x轴单位距离图表左侧距离
        "unit_position": "top", //单位位置 top顶部 bottom底部
        "show_top_label": false, //是否显示顶部标签
        "show_bottom_label": false, //是否显示底部标签
        "init_start_freq": 10000000, //X轴起始频率
        "init_end_freq": 2000000000, //X轴结束频率
        "start_freq": 10000000, //X*轴起始频率
        "end_freq": 2000000000, //X*轴结束频率
        "text_color": [51, 51, 51, 1], //X轴文本颜色
        "text_font_size": 12, //X轴文本字体大小
        "text_font_family": "Arial", //X轴文本字体
        "color": "#333", //X轴线颜色
        "width": 1, //X轴线宽度
        "item_min_width": 10, //项最小宽度
        "labels": [ //*X轴刻度标签

        ],
      },
      "button": {
        "show_zoom_button": true, //是否显示缩放按钮
        "background_button": [252, 176, 64, 1], //按钮背景色
        "show_switch_button": true, //是否显示切换按钮
      },
      "lock": { //锁屏样式
        "content": "",
        "font_size": 40, //图标字体大小
        "color": [255, 255, 255, 1], //字体颜色
        "background": [0, 60, 136, 0.5] //背景颜色
      },
      //X轴标签
      "label_angle": 90, //*X轴刻度标签角度
      "tree_data": {}, //数据
    }
    const mergedOptions = deepMerge({}, defaultOptions);
    this.options = deepMerge(mergedOptions, options);
    //初始化参数和DPR计算
    this.options.grid.left = Math.floor(this.options.grid.left * this.devicePixelRatio);
    if (this.options.x_axis.show_bottom_label) {
      this.options.grid.bottom = Math.floor(this.options.grid.bottom * this.devicePixelRatio);
    } else {
      this.options.grid.bottom = 0
    }
    if (this.options.x_axis.show_top_label) {
      this.options.grid.top = Math.floor(this.options.grid.top * this.devicePixelRatio);
    } else {
      this.options.grid.top = 0
    }
    this.options.grid.right = Math.floor(this.options.grid.right * this.devicePixelRatio);
    
    
    // 获取子元素
    const buttons = this.bottomBox.getElementsByClassName("button");
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].style.flex = "1"; // 子元素动态分配高度
      buttons[i].style.backgroundColor = colorTostring(this.options.button.background_button); //设置按钮背景色
    }
    this.zoomBox = document.getElementById('zoom_in');
    if (this.options.button.show_zoom_button) { //显示缩放按钮
      this.zoomBox.style.display = "flex"
    }
    if (this.options.button.show_switch_button) { //显示切换按钮
      this.switchBox = document.getElementById('switch_button');
      this.switchBox.style.display = "flex"
    }
    if(types!=="update"){
      this.options.x_axis.start_freq = this.options.x_axis.init_start_freq;
      this.options.x_axis.end_freq = this.options.x_axis.init_end_freq;
    }
    this.xLabelGridInfo = [] //x轴标签网格信息
    this.setCanvasSize();
    console.log("初始化配置", this.options)
  }
  /**
   * 读取json数据重置
   * @param {*} datas 
   * @returns 
   */
  readJsonData(datas) {
    if (!datas) {
      return false
    }
    this.inittreeData = datas;
    this.options.type = datas.format_type || this.options.type;
    this.gridbackground = datas.bg_color || "#fff"; //背景色
    console.log("读取数据背景色",datas.bg_color, this.gridbackground,datas)
    //console.log("读取数据设置类型", this.options.type)
    //console.log("读取数据", band_list)

    // if (this.options.isreadfile) {
    //   var freqRange = this.getFreqRange(datas.band_list);
    //   if (freqRange) {
    //     this.options.x_axis.init_start_freq = freqRange.min;
    //     this.options.x_axis.init_end_freq = freqRange.max;
    //     this.options.x_axis.start_freq = freqRange.min;
    //     this.options.x_axis.end_freq = freqRange.max;
    //     this.scaleX = 1;
    //     this.scaleY = 1;
    //   } else {
    //     console.log("获取大小失败")
    //   }
    // }

  }
  //初始化数据
  initData(datas) {
    let band_list = JSON.parse(JSON.stringify(datas.band_list));
    var start = performance.now();
    // let band_list = datas.band_list;
    console.log("band_list", band_list, this.inittreeData)

    let initgrid = []
    if (this.options.type == 1) {
      //初始id 计算宽高
      var griddatas = this.getRegionData(band_list, this.options.x_axis.start_freq, this.options.x_axis.end_freq);
      initgrid = this.calculateItemData(griddatas)
      griddatas = null; //释放内存
      //this.showconsole('计算网格1类型网格: ' + (performance.now() - start).toFixed(3) + 'ms')
    } else {
      //初始id 计算宽高
      var initgridFreq = this.getRegionData(band_list, this.options.x_axis.init_start_freq, this.options.x_axis.init_end_freq);
      if(this.options.type == 2){
        this.getMaxRowNum(initgridFreq)
      }
      //this.showconsole('计算网格其他类型过滤: ' + (performance.now() - start).toFixed(3) + 'ms')
      var initlaydata = this.layoutEvents(initgridFreq)
      console.log("布局布局数据布局数据数据", initlaydata)
      //this.showconsole('计算网格其他类型布局: ' + (performance.now() - start).toFixed(3) + 'ms')
      var layoutArr = []
      for (let i = 0; i < initlaydata.length; i++) {
        // layoutArr.push(this.layoutEvents(initlaydata[i]))
        layoutArr.push([initlaydata[i]])
      }
      console.log("布局数据", layoutArr)
      initgrid = this.initCulateItemData(layoutArr)
      initgridFreq = null; //释放内存
      layoutArr = null
      //this.showconsole('计算网格其他类型网格: ' + (performance.now() - start).toFixed(3) + 'ms')
    }
    this.initFocusList(initgrid, this.options.type)
    //this.showconsole('计算网格其他类型焦点数据: ' + (performance.now() - start).toFixed(3) + 'ms')
    this.treeData.length = 0; //清空数据
    this.treeData = initgrid;
    console.log("数据初始化成功", this.treeData)
    band_list = null;
    initgrid = null;
  }
  /**
   * 获取区域数据
   * @param {*} datas
   * @returns
   */
  getRegionData(datas, limit_start_freq, limit_end_freq) {
    let regionData = [];
    for (let i = 0; i < datas.length; i++) {
      let data = datas[i];
      let start_freq = data.start_freq;
      let end_freq = data.end_freq
      //if(end_freq<=this.options.x_axis.end_freq&&end_freq>=this.options.x_axis.start_freq){
      if(end_freq<limit_start_freq){
        continue;
      }else if (end_freq >= limit_start_freq && start_freq <= limit_end_freq) {
        regionData.push(data)
      }else if(start_freq>limit_end_freq){
        continue;
      }
    }
    return regionData
  }
  /**
   * 获取子信道行数
   * @param {*} datas 
   */
  getMaxRowNum(datas) {
    console.log("获取子信道行数", datas)
    let maxRowNum = 0;
    for (let i = 0; i < datas.length; i++) {
      let data = datas[i];
      if(data.child_band&&data.child_band.length>maxRowNum){
        maxRowNum = data.child_band.length
      }
    }
    this.wifiMaxrows= maxRowNum
  }
  /**
   * 初始焦点项
   * @param {*} datas 
   */
  initFocusList(datas, types) {
    this.focusInfo.list.splice(1)
    let columnRow = []
    for (let i = 0; i < datas.length; i++) {
      let data = datas[i];
      let focusArr = []
      let rows = []
      if (types == 1) {
        rows = data.business
      } else {
        rows = data
      }
      for (let j = 0; j < rows.length; j++) {
        let row = rows[j]
        //类型1 为竖排 其他类型横排
        let focusitem = {}
        if (types == 1) {
          focusitem = {
            "direction": "vertical", //竖排
            "type": "grid",
            "key": row.orderid,
            "column": i + 1,
            "row": j
          }
          focusArr.push(focusitem)
        } else {
          focusitem = {
            "direction": "horizontal", //横排
            "type": "grid",
            "key": row.orderid,
            "column": j + 1,
            "row": i
          }
          // if(this.options.type == 2){
          //   focusitem.childfocus=this.childFocus()
          // }
          focusArr.push(focusitem)
        }

        //更新焦点项
        if (this.focusInfo.focus && this.focusInfo.focus.type == row.orderid) {
          this.focusInfo.focus = focusitem
        }
      }
      if (types == 1) {
        this.focusInfo.list.push(focusArr)
      } else {
        columnRow.push(focusArr)
      }
    }
    if (types !== 1) {
      var maxLength = 0;
      for (var l = 0; l < columnRow.length; l++) {
        if (columnRow[l].length > maxLength) {
          maxLength = columnRow[l].length;
        }
      }

      // 转置操作，去除 null 值
      var transposedArray = [];
      for (var d = 0; d < maxLength; d++) {
        var newRow = [];
        for (var k = 0; k < columnRow.length; k++) {
          if (columnRow[k][d] !== undefined) {
            newRow.push(columnRow[k][d]); // 只有非 undefined（非 null）的值才会被加入
          }
        }
        if (newRow.length > 0) { // 只有当新行中有有效值时才添加到结果数组中
          transposedArray.push(newRow);
        }
      }
      transposedArray.forEach((item, index) => {
        this.focusInfo.list.push(item)
      })
    }
    columnRow=null;
    //console.log("更新焦点项", this.focusInfo.list)
  }

  /**
   * 计算项宽度数据
   */
  calculateItemData(datas) {
    // let basicWidth = this.options.x_axis.item_min_width
    // let newchartWidth = this.chartWidth - basicWidth * datas.length;
    let chartWidths = this.chartWidth;
    let freqdiff = this.options.x_axis.end_freq - this.options.x_axis.start_freq;
    let freqStep = chartWidths / freqdiff;
    this.freqPxStep = freqdiff / chartWidths
    this.freqXDiff = freqdiff
    let gridData = [];
    //this.focusInfo.list.splice(1)
    for (let i = 0; i < datas.length; i++) {
      let data = datas[i];
      let start_freq = data.start_freq;
      let end_freq = data.end_freq;
      let start_x = (start_freq - this.options.x_axis.start_freq) * freqStep;
      let end_x = (end_freq - this.options.x_axis.start_freq) * freqStep;
      let width = end_x - start_x;
      let label_start_x = start_freq;
      let label_start_freq = start_freq;
      let label_end_x = end_x;
      let label_end_freq = end_freq;
      data.type = "column";
      data.column_id = i;
      if (start_freq < this.options.x_axis.start_freq && end_freq >= this.options.x_axis.start_freq && end_freq <= this.options.x_axis.end_freq) {
        start_x = 0;
        label_start_x = 0;
        width = end_x - start_x;
        label_start_freq = this.options.x_axis.start_freq;
      } else if (start_freq <= this.options.x_axis.end_freq && start_freq >= this.options.x_axis.start_freq && end_freq > this.options.x_axis.end_freq) {
        end_x = (this.options.x_axis.end_freq - this.options.x_axis.start_freq) * freqStep;
        width = end_x - start_x;
        label_end_x = end_x
        label_end_freq = this.options.x_axis.end_freq;
      } else if (start_freq < this.options.x_axis.start_freq && end_freq > this.options.x_axis.end_freq) {
        start_x = 0;
        end_x = (this.options.x_axis.end_freq - this.options.x_axis.start_freq) * freqStep;
        width = end_x - start_x;
        label_start_x = 0;
        label_start_freq = this.options.x_axis.start_freq;
        label_end_x = end_x
        label_end_freq = this.options.x_axis.end_freq;
      }
      data.start_x = start_x;
      data.label_start_x = start_x;
      data.label_start_freq = label_start_freq;
      data.label_end_x = end_x;
      data.label_end_freq = label_start_freq;
      data.width = width;
      data.height = this.chartHeight * this.scaleY;
      data.end_x = end_x;
      let rows = data.business
      let rowHeight = this.chartHeight * this.scaleY / rows.length;
      //let focusArr=[]
      //console.log("计算区域高度",rowHeight,this.scaleY,this.offsetY)
      for (let j = 0; j < rows.length; j++) {
        let row = rows[j];
        row.type = "item";
        row.orderid = i + "_" + j;
        row.column_id = i;
        row.item_id = j
        row.width = width;
        row.height = rowHeight;
        row.start_freq=start_freq;
        row.end_freq=end_freq;
        row.start_x = start_x;
        row.end_x = end_x;
        row.parent_foot_notes = data.foot_notes;
        row.x = row.start_x + this.offsetX + this.options.grid.left;
        row.y = this.options.grid.top + rowHeight * j + this.offsetY;
        row.color = this.getItemColor(row.business_id)
        row.text = [this.getItemText(row.business_id)]
        //console.log("获取文字内容",row.business_id,row.text)

      }
      gridData.push(data)
    }
    return gridData
  }
  /**
   * 计算其他类型行宽数据
   * @param {*} datas 
   * @returns 
   */

  initCulateItemData(datas, typestr) {
    //console.log("其他计算行宽数据", datas, typestr)
    let chartWidths = this.chartWidth;
    let freqdiff = this.options.x_axis.end_freq - this.options.x_axis.start_freq;
    let freqStep = chartWidths / freqdiff;
    this.freqPxStep = freqdiff / chartWidths
    this.freqXDiff = freqdiff
    let gridData = [];
    let trackGap = this.options.grid.track_gap || 0; //间隙
    // if(this.options.type == 2){
    //   trackTitleHeight = this.options.grid.track_title_height || 30; //标题高
    // }
    let trackHeight = (this.chartHeight - (datas.length - 1) * trackGap) / datas.length; //行高
    if (typestr == "childwifi") {
      trackGap = 0;
      var rowsNum= this.wifiMaxrows || datas.length; //行数
      trackHeight = (this.chartHeight - (rowsNum - 1) * trackGap) / (rowsNum+1); //行高
      console.log("计算行高", trackHeight, rowsNum, this.wifiMaxrows)
    }
    
    //增加一行标题行
    
    let rowHeight = trackHeight * this.scaleY;
    
    let rowTitleHeight = 0; //标题行高
    if (typestr == "childwifi") {
      if(rowHeight>this.options.grid.channel_max_height){
        rowHeight=this.options.grid.channel_max_height;
      }
      rowTitleHeight = rowHeight
      this.options.grid.track_title_height=rowTitleHeight
    }
    for (let i = 0; i < datas.length; i++) {
      let rowarr=datas[i];
      if (typestr == "childwifi") {
        rowarr = [datas[i].child_band_ranges]
        
      }
      for (let d = 0; d < rowarr.length; d++) {
        let rows = rowarr[d];
        //行数据
        let rowdata = []
        for (let j = 0; j < rows.length; j++) {
          
          let data = rows[j];
          if (data.sub_title!= undefined) {
            data.sub_title_height = rowTitleHeight;
          }
          let start_freq = data.start_freq;
          let end_freq = data.end_freq;
          let start_x = (start_freq - this.options.x_axis.start_freq) * freqStep;
          let end_x = (end_freq - this.options.x_axis.start_freq) * freqStep;
          let width = end_x - start_x;
          let label_start_x = start_freq;
          let label_start_freq = start_freq;
          let label_end_x = end_x;
          let label_end_freq = end_freq;

          if (start_freq < this.options.x_axis.start_freq && end_freq >= this.options.x_axis.start_freq && end_freq <= this.options.x_axis.end_freq) {
            start_x = 0;
            width = end_x - start_x;
            label_start_freq = this.options.x_axis.start_freq;
          } else if (start_freq <= this.options.x_axis.end_freq && start_freq >= this.options.x_axis.start_freq && end_freq > this.options.x_axis.end_freq) {
            end_x = (this.options.x_axis.end_freq - this.options.x_axis.start_freq) * freqStep;
            width = end_x - start_x;
            label_end_x = end_x
            label_end_freq = this.options.x_axis.end_freq;
          } else if (start_freq < this.options.x_axis.start_freq && end_freq > this.options.x_axis.end_freq) {
            start_x = 0;
            end_x = (this.options.x_axis.end_freq - this.options.x_axis.start_freq) * freqStep;
            width = end_x - start_x;
            label_start_freq = this.options.x_axis.start_freq;
            label_end_x = end_x
            label_end_freq = this.options.x_axis.end_freq;
          }
          data.type = "item";
          data.column_id = j + 1;
          data.orderid = data.column_id + "_" + i;
          if (typestr == "childwifi") {
            data.childtype = "childband"
            data.parent_orderid = datas[i].parent_orderid;
            data.parent_foot_notes = datas[i].parent_foot_notes;
            data.orderid = datas[i].parent_orderid + "_" + data.orderid
          }
          data.item_id = i;
          data.label_start_x = start_x;
          data.label_start_freq = label_start_freq;
          data.label_end_x = end_x;
          data.label_end_freq = label_end_freq;
          data.width = width;
          data.height = rowHeight;
          data.start_x = start_x;
          data.end_x = end_x;
          data.x = data.start_x + this.offsetX + this.options.grid.left;
          data.y = this.options.grid.top + (rowHeight + trackGap) * i + this.offsetY+ rowTitleHeight;
          if (this.options.type == 3) {
            data.color = data.color;
            var texts = "";
            data.language.forEach((item) => {
                if (item.code == this.options.language_code) {
                  texts = item.name;
                }
              })
            // try {
            //   data.language.forEach((item) => {
            //     if (item.code == this.options.language_code) {
            //       texts = item.name;
            //     }
            //   })
            // } catch (error) {
            //   console.log("获取语言失败", error,data)
              
            // }
            
            data.text = [texts];
          }
          //  else if (this.options.type == 4){
          //   data.color = this.getItemColor(data.business_id)
          //   var texts = this.getItemText(data.business_id)
          //   texts+=data.sub_title
          //   data.text = [texts];
          // } 
          else if (typestr == "childwifi") {
            data.color = datas[i].color;
            data.text = [data.business_name];
          } else {
            data.color = this.getItemColor(data.business_id)
            data.text = [this.getItemText(data.business_id)]
            if(data.sub_title!= undefined){
              data.text.push(data.sub_title)
            }
          }
          //wifi 子信道初始化数据
          if (this.options.type == 2 && data.child_band) {
            let childTreeData = data.child_band
            childTreeData.forEach((item) => {
              item.x = data.x;
              item.y = data.y;
              item.width = data.width;
              item.height = rowHeight;
              item.start_x = data.start_x;
              item.end_x = data.end_x;
              item.parent_orderid = data.orderid;
              item.parent_foot_notes = data.foot_notes;
              item.child_band_ranges = this.getRegionData(item.child_band_range, this.options.x_axis.start_freq, this.options.x_axis.end_freq)
              //console.log("过滤子信道道数据",item.child_band_ranges)
              
            })
            //console.log("子信道init行数据",childinitData)
            data.child_business_list = this.initCulateItemData(childTreeData, "childwifi")
            
          }

          rowdata.push(data)
          //子信道解析数据
        }
        gridData.push(rowdata)
      }
    }
    return gridData
  }

  /**
   * 绘制图表
   */
  drawCharts() {
    console.log("开始绘制图表",new Date().getTime())
    this.setLoadMask(true)
    var start = performance.now(); // 高精度时间戳
    //this.showconsole('开始绘制图表',start)
    this.clearCanvas();
    this.initBackground();
    // this.debounce(this.initData(this.inittreeData).bind(this), 100) //延时绘制
    this.initData(this.inittreeData)

    this.showconsole('数据处理总时长: ' + (performance.now() - start).toFixed(3) + 'ms')
    this.drawAxis();
    //this.showconsole('drawAxis绘制总时长: ' + (performance.now() - start).toFixed(3) + 'ms')
    this.drawGrid();
    this.showconsole('绘制总时长: ' + (performance.now() - start).toFixed(3) + 'ms')
    this.setLoadMask(false)
    this.updateScrollbar(); //更新滚动条
  }
   drawChart(){
    this.debounce(this.drawCharts(), 500) //延时绘制
   }
  /**
   *清空画布
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  /**
   * 初始化背景
   */
  initBackground() {
   // this.ctx.fillStyle = colorTostring(this.options.background);
    this.ctx.fillStyle = this.gridbackground;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }




  /**
   * 初始化图表
   */
  drawAxis() {
    // 绘制x轴
    this.initdrawData();
    this.selcetedFocus();
    this.ctx.strokeStyle = colorTostring(this.options.x_axis.color);
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.options.grid.left, this.height - this.options.grid.bottom);
    this.ctx.lineTo(this.width - this.options.grid.right, this.height - this.options.grid.bottom);
    this.ctx.stroke();

    // 绘制x轴标签
    this.ctx.fillStyle = colorTostring(this.options.x_axis.text_color);
    this.ctx.textBaseline = 'top';
    this.ctx.font = `${this.options.x_axis.text_font_size * this.devicePixelRatio}px ${this.options.x_axis.text_font_family}`;
    // 绘制底部文字
    if (this.options.x_axis.show_bottom_label) {
      this.options.x_axis.labels.forEach((data, index) => {
        var x = 0;
        var y = this.height - this.options.grid.bottom + 8;
        const texts = truncateNumber(data.text / 1000000, this.options.x_axis.decimals);
        if (index == 0) {
          x = this.options.grid.left;
        } else {
          x = this.width - this.options.grid.right - this.ctx.measureText(texts).width;
        }

        this.ctx.fillText(texts, x, y);

      })
    }
    // 绘制X轴单位
    if (this.options.x_axis.unit !== "") {
      let pointx = this.width - this.options.grid.right - this.options.x_axis.unit_right - this.ctx.measureText(this.options.x_axis.unit).width;
      // 根据 unit_position 的值调整 y 坐标
      let pointy;
      switch (this.options.x_axis.unit_position) {
        case 'top': // 在右上角显示
          pointy = this.options.grid.top - this.options.x_axis.text_font_size - 14; // 距离顶部一定距离
          break;
        case 'bottom': // 在右下角显示
          pointy = this.height - this.options.grid.bottom + this.options.x_axis.text_font_size + 8; // 距离底部一定距离
          break;
        default: // 默认在右下角显示
          pointy = this.height - this.options.grid.bottom + this.options.x_axis.text_font_size + 8;
          break;
      }
      this.ctx.fillText(this.options.x_axis.unit, pointx + 8, pointy);
    }
    // 绘制顶部文字
    
    if (this.options.x_axis.show_top_label) { // 是否显示顶部标签
      let treeData = this.treeData;
      for (let i = 0; i < treeData.length; i++) {
        const columnData = treeData[i];
        if(Array.isArray(columnData)){
          //console.log("绘制顶部标签数据异常", columnData)
          continue;
        }
        if (treeData.length == 1) {
          this.drawItemText(columnData.label_start_freq, columnData.label_start_x + this.options.grid.left, this.options.grid.top - 14);
          this.drawItemText(columnData.label_end_freq, columnData.label_end_x + this.options.grid.left - 10, this.options.grid.top - 14);
        } else if (treeData.length > 1) {
          if (i == 0) {
            this.drawItemText(columnData.label_start_freq, columnData.label_start_x + this.options.grid.left, this.options.grid.top - 14);
          } else if (i < treeData.length - 1) {
            this.drawItemText(columnData.label_start_freq, columnData.label_start_x + this.options.grid.left, this.options.grid.top - 14);
          } else if (i == treeData.length - 1) {
            this.drawItemText(columnData.label_start_freq, columnData.label_start_x + this.options.grid.left, this.options.grid.top - 14);
            this.drawItemText(columnData.label_end_freq, columnData.label_end_x + this.options.grid.left - 30, this.options.grid.top - 14);
          }
        }
      }
    }
    // this.ctx.save(); // 保存当前绘图状态
    //         this.ctx.translate(x, y); // 原点移动到移动到标签位置
    //         this.ctx.rotate(angleInRadians); // 应用旋转变换
    //         this.ctx.fillText(texts, 0, 0); // 绘制旋转后的文字
    //         this.ctx.restore(); // 恢复上下文状态
    // this.ctx.textAlign = 'center';
    // let halfWidth = this.ctx.measureText(texts).width / 2
  }

  /**
   * 初始绘制数据
   */
  initdrawData() {
    //计算x轴标签底部
    let labelx_axis = [{
      offsetx: 0,
      text: this.options.x_axis.start_freq
    }, {
      offsetx: this.chartWidth + this.options.grid.left,
      text: this.options.x_axis.end_freq
    }]
    this.options.x_axis.labels = labelx_axis;
  }
  /**
   * 绘制网格
   */
  drawGrid() {
    //this.ctx.fillStyle = colorTostring(this.options.grid.background);
    this.ctx.fillStyle = this.gridbackground;
    console.log("绘制背景色", this.gridbackground)
    this.ctx.fillRect(this.options.grid.left, this.options.grid.top, this.chartWidth, this.chartHeight);
    this.ctx.strokeStyle = colorTostring(this.options.grid.stroke_color);
    this.ctx.lineWidth = this.options.grid.stroke_width;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(
      this.options.grid.left,
      this.options.grid.top,
      this.chartWidth,
      this.chartHeight
    );
    // 裁剪谱线超过图表区域的部分
    this.ctx.clip();
    this.ctx.beginPath();
    var strokeWidth = this.options.grid.stroke_width || 2;
    this.ctx.lineWidth = strokeWidth;
    let isHaveselectedArea = false; //是否已经绘制了选中的区域
    for (let i = 0; i < this.treeData.length; i++) {
      let itemArray = []
      if (this.options.type !== 1) {
        itemArray = this.treeData[i]
      } else {
        itemArray = this.treeData[i].business;
      }
      for (let j = 0; j < itemArray.length; j++) {
        let row = itemArray[j];
        let x = row.x;
        let y = row.y;
        let width = row.width;
        let height = row.height;
        this.ctx.fillStyle = row.color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = this.options.grid.stroke_color || '#333';
        this.ctx.setLineDash([]);
        this.ctx.lineWidth = strokeWidth;
        // 绘制区域边框
        if (this.focusInfo.focus && this.focusInfo.focus.key == row.orderid) {
          // 高亮选中的区域
          isHaveselectedArea = true;
          this.selectedArea = row
        }
        this.ctx.strokeRect(x + strokeWidth / 2, y + strokeWidth / 2, width - strokeWidth, height - strokeWidth);
        // 绘制文字
        //console.log("绘制项",row)

        if(this.options.type == 2&&this.options.channel_show=="show"){
          this.drawTree(row.child_business_list)
          this.drawTexts(row.text, x, y, width, this.options.grid.track_title_height);
        //}else if(this.options.type == 2&&this.options.channel_show=="auto"&&row.child_business_list && row.child_business_list.length > 0 && height > row.child_business_list.length * this.options.grid.track_min_height && width > 60) {
        }else if(this.options.type == 2&&this.options.channel_show=="auto"&&row.child_business_list && row.child_business_list.length > 0 && height > 18 && width > 50) {
        
          //this.showconsole(row.text+"满足条件绘制子信道长度")
              this.drawTree(row.child_business_list)
              this.drawTexts(row.text, x, y, width, this.options.grid.track_title_height);
        }else{
          this.drawTexts(row.text, x, y, width, height);
        }
      }
    }
    // 高亮选中的区域
    if (this.selectedArea && isHaveselectedArea) {
      this.ctx.strokeStyle = colorTostring(this.options.grid.stroke_focus_color);
      this.ctx.setLineDash([]);
      this.ctx.lineWidth = this.options.grid.stroke_focus_width;
      var x = this.selectedArea.x;
      var y = this.selectedArea.y;
      let width = this.selectedArea.width;
      let height = this.selectedArea.height;
      this.ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
      console.log("绘制选中11111区域",this.selectedArea)
    }
    this.ctx.restore();
  }

  drawTree(treeDatas) {
    //console.log("绘制子信道数据", treeDatas)
    let strokeWidth = 1;
    for (let i = 0; i < treeDatas.length; i++) {
      let itemArray = treeDatas[i]
      if(treeDatas[i].length<1){
        continue;
      }
      let rowwidth=itemArray[treeDatas[i].length-1].end_x-itemArray[0].x+this.options.grid.left;
      this.ctx.fillStyle = itemArray[0].color;
      this.ctx.fillRect(itemArray[0].x, itemArray[0].y, rowwidth, itemArray[0].height);
      this.ctx.lineWidth = strokeWidth;
      this.ctx.strokeStyle = '#666';
      this.ctx.setLineDash([5, 5], 0); // 设置虚线样式
      this.ctx.strokeRect(itemArray[0].x + strokeWidth / 2, itemArray[0].y + strokeWidth / 2, rowwidth - strokeWidth, itemArray[0].height - strokeWidth);

      for (let j = 0; j < itemArray.length; j++) {
        let row = itemArray[j];
        let x = row.x;
        let y = row.y;
        let width = row.width;
        let height = row.height;
        this.drawTexts(row.text, x, y, width, height);
        if(j>0){
          //绘制垂直虚线
          this.ctx.strokeStyle = '#666';
          this.ctx.beginPath();
          this.ctx.moveTo(x,y);
          this.ctx.lineTo(x,y+height)
          this.ctx.stroke();
        }
      }
      itemArray = null;
    }
  }
  drawTrees(treeDatas) {
    console.log("绘制子信道数据", treeDatas)
    let strokeWidth = 1;
    for (let i = 0; i < treeDatas.length; i++) {
      let itemArray = treeDatas[i]
      // this.ctx.fillStyle = itemDatas.color;
      // let childItem=itemArray[0]
      // this.ctx.fillRect(itemDatas.x, childItem.y, itemDatas.width, childItem.height);

      
      // if(itemArray.length>0){
      //   this.ctx.fillStyle = itemArray[0].color;
      // }
      
      for (let j = 0; j < itemArray.length; j++) {
        let row = itemArray[j];
        let x = row.x;
        let y = row.y;
        let width = row.width;
        let height = row.height;
        this.ctx.fillStyle = row.color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.lineWidth = strokeWidth;
        this.ctx.strokeStyle = '#666';
        this.ctx.setLineDash([5, 5], 0); // 设置虚线样式
        // 绘制区域边框
        if (this.focusInfo.focus && this.focusInfo.focus.key == row.orderid) {
          // 高亮选中的区域
          isHaveselectedArea = true;
          this.selectedArea = row
          console.log("绘制选中区域", this.selectedArea)
        }
        this.ctx.strokeRect(x + strokeWidth / 2, y + strokeWidth / 2, width - strokeWidth, height - strokeWidth);
        // 绘制文字
        // console.log("绘制项",row)
        this.drawTexts(row.text, x, y, width, height);
      }
      itemArray = null;
    }
  }

  /**
   * 获取频谱图颜色
   * @param {*} id 
   */

  getItemColor(id) {
    let listdata = this.inittreeData.business_list;
    let color = "#ddd";
    for (let i = 0; i < listdata.length; i++) {
      if (listdata[i].business_id == id) {
        color = listdata[i].color;
        break;
      }
    }
    return color
  }
  /**
   * 获取文字
   * @param {*} id 
   * @returns 
   */
  getItemText(id) {
    let listdata = this.inittreeData.business_list;
    let text = "";
    for (let i = 0; i < listdata.length; i++) {
      if (listdata[i].business_id == id) {
        let languagelist = listdata[i].language;
        for (let j = 0; j < languagelist.length; j++) {
          if (languagelist[j].code == this.options.language_code) {
            text = languagelist[j].name;
            break;
          }
        }
      }
    }
    return text
  }
  drawItemText(text, x, y) {
    //console.log("绘制drawItemText",texts,x,y)
    const texts = truncateNumber(text / 1000000, "");
    
    this.ctx.save(); // 保存当前绘图状态
    this.ctx.translate(x, y); // 原点移动到移动到标签位置
    // this.ctx.rotate(-Math.PI / 2); // 应用旋转变换
    this.ctx.textAlign = 'left';
    this.ctx.fontSize = "10px";
    this.ctx.textBaseline = 'top'
    this.ctx.fillText(texts, 0, 0); // 绘制旋转后的文字
    this.ctx.restore(); // 恢复上下文状态
    // this.ctx.textAlign = 'center';
  }
  // 绘制区域中的文字
  drawText(text, x, y, width, height) {
    var fontSize = 16;
    this.ctx.font = fontSize + "px Arial";
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    var textWidth = this.ctx.measureText(text).width;
    // 文字显示方式
    if (width >= textWidth) {
      // 如果宽度足够，一行显示文字并居中
      this.ctx.fillText(text, x + width / 2, y + height / 2);
    } else if (height < fontSize) {
      console.log("高度不足以显示文字", height, fontSize)
      // 如果高度不足以显示文字，文字不显示
      return;
    } else if (width >= fontSize * 2) {
      // 如果宽度不足以显示一行文字但足够显示两行
      var lineHeight = fontSize * 1.2;
      var maxLines = Math.floor(height / lineHeight);
      var lines = this.splitText(text, width, maxLines);

      var totalHeight = lines.length * lineHeight;
      var startY = y + height / 2 - totalHeight / 2 + lineHeight / 2;
      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        this.ctx.fillText(line, x + width / 2, startY + index * lineHeight);
      }
    } else {
      // 如果宽度不足以显示两行文字，文字竖直显示
      var maxHeight = height - 10; // 留点边距
      var maxLines = Math.floor(maxHeight / fontSize);
      if (maxLines == 0 || width < fontSize) {
        return;
      }
      var lines = this.splitText(text, fontSize, maxLines);

      var startY = y + height / 2 - lines.length * fontSize / 2;
      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        this.ctx.fillText(line, x + width / 2, startY + index * fontSize);
      }
    }
  }

  // 处理文本的拆分
  splitText(text, maxWidth, maxLines) {
    var lines = [];
    var currentLine = '';
    if(text==undefined||text==null||text==''){
      return lines
    }
    for (var i = 0; i < text.length; i++) {
      var testLine = currentLine + text[i];
      var testWidth = this.ctx.measureText(testLine).width;

      if (testWidth > maxWidth) {
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = text[i]; // Start new line with the current character
      } else {
        currentLine = testLine;
      }

      if (lines.length >= maxLines) {
        break;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    if (maxLines == 0) {
      lines.splice(0);
    }
    // 如果行数超过最大行数，截断并添加省略号
    if (lines.length > maxLines) {
      lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '...';
      // 删除多余的行
      lines.splice(maxLines);
    }

    return lines;
  }


  // 绘制区域中的多行文字
  drawTexts(texts, x, y, width, height){
      // 生成最终行数组
      var lineHeight=26;
      var fontSize=16;
      if(height<=14){
        return false
      }else if(height<=20){
        lineHeight=18
        fontSize=12
      }else if(height<26){
        lineHeight=20
        fontSize=14
      }
      // width = width - 6; // 减去左右边距
      // height = height - 6; // 减去上下边距
      if(height<lineHeight||width<30||!texts instanceof Array){
        return false
      }
      this.ctx.font = fontSize + "px Arial";
      this.ctx.fillStyle = 'black';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      const lines = [];
      // 计算总高度  
      let totalHeight = 0; 
      texts.forEach(paragraph => {
      const words = paragraph.split('');
      let currentLine = '';
      let isFirstLine = false; // 是否是第一行

      while (words.length > 0) {
        // 添加缩进
        if (isFirstLine) {
          currentLine = '  '; // 两个空格占位
          isFirstLine = false;
        }

        const nextWord = words.shift();
        const testLine = currentLine + nextWord;
        const testWidth =  this.ctx.measureText(testLine).width+6;

        if (testWidth <= width&&width >32) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          totalHeight += lineHeight;
          currentLine = nextWord;
          
          // 高度检查
          if (totalHeight + lineHeight > height) break;
        }
      }

      if (currentLine) lines.push(currentLine);
      totalHeight += lineHeight;
    });
    // 处理省略号
    if (totalHeight > height) {
      const maxLines = Math.floor(height / lineHeight);
      lines.splice(maxLines); 
      //if (lines.length >= maxLines&&lines.length> 0) {
      if (lines.length >= maxLines&&maxLines>0) {
        // const lastLine = lines[maxLines - 1];
        // const ellipsisWidth = this.ctx.measureText("...").width;
        
        // let trimmedLine = lastLine;
        // while (this.ctx.measureText(trimmedLine).width + ellipsisWidth > width) {
        //   trimmedLine = trimmedLine.slice(0, -1);
        // }
        // lines[maxLines - 1] = trimmedLine + "...";
        lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '...';
      }
    }
    if (lines.length>0) {
      // var fontSize = 16;
      // this.ctx.font = fontSize + "px Arial";
      // this.ctx.fillStyle = 'black';
      // this.ctx.textAlign = 'center';
      // this.ctx.textBaseline = 'middle';
      // var startY = y + height / 2 - lines.length * fontSize / 2;
      // for (let index = 0; index < lines.length; index++) {
      //   const line = lines[index];
      //   this.ctx.fillText(line, x + width / 2, startY + index * lineHeight);
      // }
      var startY = y + height / 2 - (lines.length-1) * lineHeight / 2;
      var startX = x + (width+4) / 2;
      lines.forEach((line, index) => {
        this.ctx.fillText(line, startX, startY + index * lineHeight);
      });
    }
  }
  /**
   * 加载数据
   * @param {*} id 谱线id
   * @param {*} data 谱线数据
   */

  onloadData(data) {
    this.inittreeData = data;
    this.drawChart(data);
  }


  //监听手指触摸操作
  /**
   * 
   * @param {*} e 
   */
  touchstart(e) {
    this.isDragging = false
    if (e.touches.length == 1) {
      this.isTouchDragging = true;
      this.touchStartX = e.touches[0].clientX - this.offsetX;
      this.touchStartY = e.touches[0].clientY;
    } else if (e.touches.length == 2) {
      this.isTouching = true;
      var touch1 = e.touches[0];
      var touch2 = e.touches[1];
      //this.touchStartDist = Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);
      this.touchStartInfo={
        start_freq:this.options.x_axis.start_freq,//触摸显示开始频率
        end_freq:this.options.x_axis.end_freq,//触摸显示结束频率
        touch_center_freq:this.getTouchMouseVal(e).x
      }
      console.log("开始手指频率",this.touchStartInfo)
      this.showconsole(this.touchStartInfo)
      this.touchStartDist = this.getDistance(touch1, touch2)
      this.prevTouchDistance = this.touchStartDist;
      this.lastTouchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2; // 计算两手指中心点的X坐标
    }
  }
  //监听手指触摸移动
  /**
   * 移动
   * @param {*} e 
   */
  touchmove(e) {
    this.isDragging = true
    if (e.touches.length == 1 && this.isTouchDragging) {
      //console.log("移动",e)
      // 根据手指的移动方向来决定缩放方向
      if (Math.abs(this.touchStartX - e.touches[0].clientX) > Math.abs(e.touches[0].clientY - this.touchStartY)) { // 主要是x轴方向的变化
        this.scaleDirection = 'x'
      } else { // 主要是y轴方向的变化
        this.scaleDirection = 'y'
      }
      if (this.scaleDirection === 'x') {
        let moveX = this.touchStartX - e.touches[0].clientX;
        this.changeMovex(moveX, "touchmove")
        this.touchStartX = e.touches[0].clientX
      }
      else if (this.scaleDirection === 'y') {
        let offsety = e.touches[0].clientY - this.touchStartY;
        this.changeMovey(offsety, "touchmove")
        this.touchStartY = e.touches[0].clientY
      }

    } else if (this.isTouching && e.touches.length == 2) {
      var touch1 = e.touches[0];
      var touch2 = e.touches[1];
      var touchDist = this.getDistance(touch1, touch2);
      var angleNum = this.getAngle(touch1, touch2)
      const dx = e.touches[0].pageX - e.touches[1].pageX;
      const dy = e.touches[0].pageY - e.touches[1].pageY;

      // 根据手指的移动方向来决定缩放方向
      if (Math.abs(dx) > Math.abs(dy)) { // 主要是x轴方向的变化
        this.scaleDirection = 'x'
      } else { // 主要是y轴方向的变化
        this.scaleDirection = 'y'
      }
      let scaleX = this.scaleX;
      let scaleY = this.scaleY;
      // 计算触摸移动的缩放因子
      var scaleChange = touchDist / this.prevTouchDistance;
      if (this.scaleDirection === 'x' || this.scaleDirection === 'both') {
        scaleX *= scaleChange;
        scaleX = scaleX.toFixed(1) - 0;
        var freqdiff = this.options.x_axis.init_end_freq - this.options.x_axis.init_start_freq;
        //var freqdiff = this.options.x_axis.end_freq - this.options.x_axis.start_freq;
        if (freqdiff < this.chartWidth) {
          return false
        }
        // 防止缩放过小或过大
        if (scaleX < 1) scaleX = 1;
        if (scaleX > 2000) scaleX = 2000;
        // 更新触摸的上一距离
        this.prevTouchDistance = touchDist;
    
        var mouseVal = this.touchStartInfo.touch_center_freq;
        this.showconsole("放大中心触摸频率"+mouseVal)
        var newfreqStep = Math.floor(freqdiff / scaleX / 2) * 2;
        var minValue = Math.floor(mouseVal-(mouseVal-this.touchStartInfo.start_freq)/(this.touchStartInfo.end_freq-this.touchStartInfo.start_freq)*newfreqStep);
        var maxValue = Math.floor(minValue + newfreqStep)
        if (minValue <= this.options.x_axis.init_start_freq && maxValue >= this.options.x_axis.init_end_freq) {
          minValue = this.options.x_axis.init_start_freq;
          maxValue = this.options.x_axis.init_end_freq;
          scaleX = 1; // 重置缩放比例
        }
        if (minValue < this.options.x_axis.init_start_freq) {
          console.log("处理超过最小值", minValue)
          minValue = this.options.x_axis.init_start_freq;
          maxValue = Math.floor(minValue + newfreqStep)
        }
        if (maxValue > this.options.x_axis.init_end_freq) {
          console.log("处理超过最大值", maxValue)
          maxValue = this.options.x_axis.init_end_freq;
          minValue = Math.ceil(maxValue - newfreqStep);
        }
        if (minValue >= this.options.x_axis.init_start_freq && maxValue <= this.options.x_axis.init_end_freq) {

          // if (this.onFreqChangeCallback) {
          //   this.onFreqChangeCallback(minValue, maxValue)
          // }

          this.options.x_axis.start_freq = minValue;
          this.options.x_axis.end_freq = maxValue;
          this.scaleX = scaleX;
          this.drawChart(); // 重新绘制地图
          // this.showconsole({
          //   type: "手指缩放视图",
          //   "start_freq": this.options.x_axis.start_freq,
          //   "end_freq": this.options.x_axis.end_freq,
          //   "scalex": this.scaleX
          // })
          console.log("更改视图频率范围", this.options.x_axis.start_freq, this.options.x_axis.end_freq, this.scaleX, this.scaleY)
        }
      }
      if (this.scaleDirection === 'y' || this.scaleDirection === 'both') {
        scaleY *= scaleChange;
        scaleY = scaleY.toFixed(1) - 0
        console.log("scaleY", scaleY)
        if (scaleY < 1) {
          scaleY = 1
          this.offsetY = 0
        };
        if (scaleY > 3) scaleY = 3;
        this.scaleY = scaleY;
        // this.updateScrollbar()
        this.drawChart();
      }





    }

  }
  //监听手指触摸结束
  /**
   * 触摸结束
   * @param {*} e
   */
  touchend(e) {
    e.preventDefault();
    console.log("触摸结束", e)
    if (this.isDragging && this.onFreqChangeCallback) {
      if (this.callbackFreq.min !== this.options.x_axis.start_freq || this.callbackFreq.max !== this.options.x_axis.end_freq) {
        console.log("触摸touchend结束回调", this.options.x_axis.start_freq, this.options.x_axis.end_freq)
        this.onFreqChangeCallback(this.options.x_axis.start_freq, this.options.x_axis.end_freq)
        this.callbackFreq = {
          min: this.options.x_axis.start_freq,
          max: this.options.x_axis.end_freq
        }
      }
    }
    if (this.isDragging == false) {
      console.log("手指点击结束", e)
      this.handleClick(e, "touch")
    }
    if (e.touches.length < 2) {
      this.isTouchDragging = false;
      this.isTouching = false;
      this.prevTouchDistance = 0;
    }

  };
  /**
   * 计算两个触摸点之间的距离
   * @param {*} touch1 
   * @param {*} touch2 
   * @returns 
   */
  getDistance(touch1, touch2) {
    // let dx = touch1.clientX - touch2.clientX;
    // let dy = touch1.clientY - touch2.clientY;
    const dx = touch2.pageX - touch1.pageX;
    const dy = touch2.pageY - touch1.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * 计算角度
   * @param {*} touch1 
   * @param {*} touch2 
   * @returns 
   */
  getAngle(touch1, touch2) {
    const dx = touch2.pageX - touch1.pageX;
    const dy = touch2.pageY - touch1.pageY;
    const angleRad = Math.atan2(dy, dx); // 返回的是弧度
    return angleRad * (180 / Math.PI); // 转换成度数
  }
  //监听事件
  /**
   * 鼠标按下事件
   * @param {*} event 
   */
  mousedown(event) {
    console.log("点击了mousedown")
    this.mousedownInfo = {
      isMouseDown: true,
      startX: event.offsetX,
      startY: event.offsetY,
      mouseupx: 0,
      mouseupy: 0,
      button: event.button
    }
    if (event.button === 0) { // 左键
      // isDragging = true;
      // startY = event.clientY;
      this.ctx.canvas.style.cursor = 'grabbing';
    } else if (event.button === 2) { // 右键
      this.ctx.canvas.style.cursor = 'grab';
    }
  }
  /**
   * 鼠标松开事件
   * @param {*} event
   */
  mouseup(event) {
    console.log("点击了mouseup")
    let mousedowinfo = {
      isMouseDown: false,
      mouseupx: event.offsetX,
      mouseupy: event.offsetY,
      button: event.button
    }
    this.mousedownInfo = {
      ...this.mousedownInfo,
      ...mousedowinfo
    }
    this.ctx.canvas.style.cursor = 'default';
  }
  /**
   * 鼠标移动
   * @param {*} event 
   */
  mousemove(event) {
    if (this.mousedownInfo.isMouseDown) {
      if (this.moveInfo.preX == 0) {
        this.moveInfo.preX = this.mousedownInfo.startX;
        this.moveInfo.preY = this.mousedownInfo.startY;
      }
      const moveX = event.offsetX - this.moveInfo.preX;
      const moveY = this.moveInfo.preY - event.offsetY;
      const moveDirX = event.offsetX - this.mousedownInfo.startX;
      const moveDirY = event.offsetY - this.mousedownInfo.startY;
      let moveDir = "horizontally";
      // 判断移动方向
      if (Math.abs(moveDirX) > Math.abs(moveDirY)) {
        moveDir = "horizontally";
        this.changeMovex(moveX, "mousemove")
      } else {
        moveDir = "vertically";
        this.changeMovey(moveY, "mousemove")
      }

    } else {
      // 鼠标移动
    }
    this.moveInfo = {
      isMove: true,
      preX: event.offsetX,
      preY: event.offsetY,
      moveX: event.offsetX,
      moveY: event.offsetY
    }
  }
  /**
   * 移动像素更改
   * @param {*} movex 
   * @param {*} type 
   */
  changeMovex(movex, type) {
    movex = movex.toFixed(1) - 0
    if (this.scaleX == 1) {
      return false
    }
    let diffPx = this.freqPxStep * movex
    let minValue = Math.floor(this.options.x_axis.start_freq + diffPx)
    let maxValue = Math.floor(this.options.x_axis.end_freq + diffPx)
    if (minValue <= this.options.x_axis.init_start_freq && maxValue >= this.options.x_axis.init_end_freq) {
      minValue = this.options.x_axis.init_start_freq;
      maxValue = this.options.x_axis.init_end_freq;
      scaleX = 1; // 重置缩放比例
    }
    if (minValue < this.options.x_axis.init_start_freq) {
      console.log("处理超过最小值", minValue)
      minValue = this.options.x_axis.init_start_freq;
      maxValue = Math.floor(minValue + this.freqXDiff)
    }
    if (maxValue > this.options.x_axis.init_end_freq) {
      console.log("处理超过最大值", maxValue)
      maxValue = this.options.x_axis.init_end_freq;
      minValue = Math.ceil(maxValue - this.freqXDiff);
    }
    if (minValue >= this.options.x_axis.init_start_freq && maxValue <= this.options.x_axis.init_end_freq) {
      // if (this.onFreqChangeCallback) {
      //   this.onFreqChangeCallback(minValue, maxValue)
      // }
      this.options.x_axis.start_freq = minValue;
      this.options.x_axis.end_freq = maxValue;
      this.drawChart();

      console.log("更改移动视图频率范围", type, diffPx, this.options.x_axis.start_freq, this.options.x_axis.end_freq)
    }
  }
  /**
   * 改变y轴偏移
   * @param {*} movey 
   * @param {*} type 
   */
  changeMovey(movey, type) {
    movey = movey.toFixed(1) - 0
    if (this.scaleY == 1) {
      this.offsetY = 0
      // this.updateScrollbar()
      this.drawChart();
    } else {
      let newoffsety = this.offsetY + movey;
      let maxValue = 0;
      let minValue = -this.chartHeight * (this.scaleY - 1)
      if (newoffsety <= maxValue && newoffsety >= minValue) {
        this.offsetY = newoffsety
        console.log("更改移动y", type, this.offsetY, "y层级", this.scaleY, this.chartHeight, this.chartHeight * (this.scaleY - 1))
        // this.updateScrollbar()
        this.drawChart();
      } else if (newoffsety > maxValue) {
        this.offsetY = maxValue
      } else if (newoffsety < minValue) {
        this.offsetY = minValue
      } else {
        this.offsetY = 0
      }
    }
  }
  /**
   * 鼠标移出控件
   * @param {*} event 
   */
  mouseout(event) {
    event.preventDefault();
    this.mousedownInfo.isMouseDown = false
    this.moveInfo = {
      isMove: false,
      preX: 0,
      preY: 0,
      moveX: 0,
      moveY: 0
    }
  }
  /**
   * 鼠标滚轮事件
   * @param {*} event
   * 
   */
  handleWheel(event) {
    event.preventDefault(); // 阻止默认滚动行为
    const delta = event.deltaY < 0 ? 1 : -1; //下滚缩小，上滚放大
    //const delta = Math.sign(event.deltaY);
    this.handleZoom(event, delta);
  }
  /**
   * 双击事件
   * @param {*} event 
   */
  handleDblClick(event) {
    console.log("handleDblClick", event);
  }
  /**
   * 点击事件
   * @param {*} event 
   */
  handleClick(event, type) {
    console.log("handleClick" + type, event);
    if (type == "touch") {
      event = event.changedTouches[0]
    }
    const rect = this.canvas.getBoundingClientRect(); // 获取 Canvas 的位置和大小
    let mouseX = event.clientX - rect.left; // 计算鼠标相对于 Canvas 的 X 坐标
    let mouseY = event.clientY - rect.top; // 计算鼠标相对于 Canvas 的 Y 坐标
    var clickedArea = this.checkClick(this.treeData, mouseX, mouseY);
    console.log("点击区域", clickedArea, mouseX, mouseY)
    if (clickedArea) {
      this.selectedArea = clickedArea.area;
      let focusList = this.getFocusList(clickedArea.area);
      console.log("表格焦点获取", clickedArea, focusList)

      this.changeFocus(focusList.column, focusList.row, "grid")

      //回调消息
      if (this.onClickGridCallback) {
        if (clickedArea.childArea) {
          this.onClickGridCallback(clickedArea.childArea.area)
        } else {
          this.onClickGridCallback(clickedArea.area)
        }

        this.focusInfo.prefocus = this.focusInfo.focus;
        //this.focusInfo.focus = null;
        if (this.onFocusCallback) {
          this.onFocusCallback("")
        }
      }
      this.drawChart(); // 重新绘制地图并高亮选中区域
    } else {
      this.selectedArea = null;
      this.drawChart(); // 重新绘制地图并去掉高亮
    }
  }
  /**
   * 获取网格数据
   */
  getGridInfo(treedata, orderid) {
    let returnData = null
    for (let i = 0; i < treedata.length; i++) {
      let areas = []
      if (this.options.type !== 1) {
        areas = treedata[i]
      } else {
        areas = treedata[i].business;
      }
      for (var index = 0; index < areas.length; index++) {
        var area = areas[index]
        if (area.orderid == orderid) {
          returnData = area
          break
        }
      }
    }
    return returnData
  }
  /**
   * 获取焦点项
   * @param {*} orderid 
   * @returns 
   */
  getFocusList(clickedArea) {
    let orderid = clickedArea.orderid
    let returnData = null
    let treedata = this.focusInfo.list;
    for (let i = 0; i < treedata.length; i++) {
      let areas = treedata[i]
      for (var index = 0; index < areas.length; index++) {
        var area = areas[index]
        if (area.key == orderid) {
          returnData = area
          break
        }
      }
    }
    return returnData
  }
  /**
   * 检查点击是否在区域内
   * @param {*} x 坐标
   * @param {*} y 坐标
   * @returns 
   */

  checkClick(treedata, x, y) {
    for (let i = 0; i < treedata.length; i++) {
      let areas = []
      if (this.options.type !== 1) {
        areas = treedata[i]
      } else {
        areas = treedata[i].business;
      }
      for (var index = 0; index < areas.length; index++) {
        var area = areas[index]
        var areaX = area.x;
        var areaY = area.y;
        var areaWidth = area.width;
        var areaHeight = area.height;
        if (x >= areaX && x <= areaX + areaWidth && y >= areaY && y <= areaY + areaHeight) {
          console.log("点击区域", treedata[i].business, area)
          var childArea = null
          if (area.child_business_list && area.child_business_list.length > 0) {
            childArea = this.checkClick(area.child_business_list, x, y)
            console.log("子区域点击区域", childArea)
          }
          if (childArea) {
            return {
              childArea: childArea,
              area: area
            }
          } else {
            return {
              area: area
            }
          }
        };
      }
    }
  }
  /*
   * 鼠标右键事件
   * @param {*} event
   */
  handleContextMenu(event) {
    console.log("handleContextMenu", event);
  }
  /**
   * 按键按下事件
   * @param {*} event
   */
  handleKeydown(event) {
    //console.log("handleKeydown", event);
    // switch (event.keyCode) {
    //   case 37: // 左箭头
    //     console.log("左箭头");
    //     break;
    //   case 38: // 上箭头
    //     console.log("上箭头");
    //     this.changeThreshold(+0.5)
    //     break;
    //   case 39: // 右箭头
    //     console.log("右箭头");
    //     break;
    //   case 40: // 下箭头
    //     this.changeThreshold(-0.5)
    //   default:
    //     break;
    // }
    if (event.key === 'x') {
      this.scaleDirection = 'x'; // 只缩放X轴
    } else if (event.key === 'y') {
      this.scaleDirection = 'y'; // 只缩放Y轴
    } else if (event.key === 'b') {
      this.scaleDirection = 'both'; // 同时缩放X轴和Y轴
    }
  }
  /**
   * 按键松开事件
   * @param {*} event 
   */
  handleKeyup(event) {
    console.log("handleKeyup按键松开事件", event);
    switch (event.keyCode) {
      case 37: // 左箭头
        console.log("左箭头松开");
        break;
      case 38: // 上箭头
        console.log("上箭头松开");
        this.options.threshold.is_mouse = false;
        break;
      case 39: // 右箭头
        console.log("右箭头松开");
        break;
      case 40: // 下箭头
        console.log("下箭头松开");
        this.options.threshold.is_mouse = false;
      default:
        break;
    }
  }
  /**
   * 滚动条改变事件
   * @param {*} event 
   * @returns 
   */
  handleScroll(event) {
    event.preventDefault(); // 阻止默认滚动行为
    //console.log('当前距顶部距离:', this.scrollBar.scrollTop);
  }
  /**
   * 滚动条手指移动事件
   * @param {*} offsety 
   */
  mousedownScroll(event) {
    event.preventDefault(); 
    this.scrollBarInfo.isMove = true;
  }
  mouseupScroll(event) {
    event.preventDefault(); 
    this.scrollBarInfo.isMove = false;
  }
  mousemoveScroll(event){
    event.preventDefault(); // 阻止默认滚动行为
    console.log('mousemoveScroll顶部距离:', this.scrollBar.scrollTop,this.scrollBarInfo.isMove);
    if(this.offsetY != -this.scrollBar.scrollTop){
      this.setOffsetY(-this.scrollBar.scrollTop)
    }
  }
  setOffsetY(offsety) {
    this.offsetY = offsety;
    this.drawChart(); // 重新绘制图表
  }
  /**
   * 更新滚动条
   * @returns
   */
  updateScrollbar() {
    // 计算滚动条的位置和大小
    var isshow=false
    if(this.options.scrollbar_show=="show"){
      this.scrollBar.style.display = "block";
      isshow=true
    }else if(this.options.scrollbar_show=="hide"){
      this.scrollBar.style.display = "none"; 
    }else{
      if(this.scaleY>1){
        this.scrollBar.style.display = "block"; 
        isshow=true
      }else{
        this.scrollBar.style.display = "none"; 
      }
    }
    if(isshow){
      this.scrollBarContent.style.height = this.chartHeight*this.scaleY + "px";
      const scrollBarHeight = this.scrollBarContent.offsetHeight;
      this.scrollBar.scrollTop = -this.offsetY;
      console.log("滚动条位置", this.scrollBar.scrollTop, this.offsetY, scrollBarHeight)
    }
  }
  /**
   * 窗口大小改变事件
   */
  resizeCanvas() {
    this.setCanvasSize(); // 重新设置 Canvas 尺寸
    this.drawChart(); // 重新绘制图表以适应新尺寸
  }
  /**
   * 设置图表大小
   * @param {*} widhts 宽度
   *  @param {*} heights 高度
   */
  setChartSize(widths, heights) {
    if (widths && heights) {
      this.options.width = widths
      this.options.height = heights
    }
    this.setCanvasSize(widths, heights)
    this.drawChart(); // 重新绘制图表以适应新尺寸
  }
  //按钮点击设置缩放
  setZomm(type, event) {
    event.stopPropagation(); // 阻止事件冒泡
    console.log("点击缩放set",this.focusInfo.list)
    this.focusInfo.focus = this.focusInfo.list[0][0]
    this.drawChart(); // 重新绘制图表

    if (this.onClickZommCallback) {
      this.onClickZommCallback(type)
    }
  }
  //[切换]按钮点击设置
  setSwitch(event) {
    event.stopPropagation(); // 阻止事件冒泡
    var order=this.focusInfo.list[0].length-1;
    this.focusInfo.focus = this.focusInfo.list[0][order]
    this.focusInfo.prefocus = this.focusInfo.list[0][order];
    //this.focusInfo.focus = null;
    this.drawChart(); // 重新绘制图表
    if (this.onSwitchCallback) {
      this.onSwitchCallback()
      if (this.onFocusCallback) {
        this.onFocusCallback("")
      }
    }
  }
  /**
   * 缩放事件
   * @param {*} event 
   * @param {*} types 
   * @param {*} delta 
   * @returns 
   */
  handleZoom(event, delta) {
    event.preventDefault(); // 阻止默认滚动行为
    let type = this.getMousePosition()
    let zoomFactor = 1.1; // 缩放因子
    if (event.deltaY < 0) {
      zoomFactor = 1.1
    } else {
      zoomFactor = 0.9
    }
    let scaleX = this.scaleX;
    let scaleY = this.scaleY;
    if (this.scaleDirection === 'x' && type == "grid" || this.scaleDirection === 'both' && type == "grid") {
      scaleX *= zoomFactor; // 调整X轴的缩放比例
      scaleX = scaleX.toFixed(1) - 0
      var freqdiff = this.options.x_axis.init_end_freq - this.options.x_axis.init_start_freq;
      if (freqdiff < this.chartWidth) {
        return false
      }
      // 防止缩放过小或过大
      if (scaleX < 0.5) scaleX = 0.5;
      if (scaleX > 2000) scaleX = 2000;
      var mouseVal = this.getMouseVal(event, 0).x;

      var newfreqStep = Math.floor(freqdiff / scaleX / 2) * 2;
      console.log("层级变化", newfreqStep, scaleX)
      var minValue = Math.floor(mouseVal - (mouseVal - this.options.x_axis.start_freq)/(this.options.x_axis.end_freq-this.options.x_axis.start_freq)*newfreqStep);
      var maxValue = Math.floor(minValue + newfreqStep)
      if (minValue <= this.options.x_axis.init_start_freq && maxValue >= this.options.x_axis.init_end_freq) {
        minValue = this.options.x_axis.init_start_freq;
        maxValue = this.options.x_axis.init_end_freq;
        scaleX = 1; // 重置缩放比例
      }
      if (minValue < this.options.x_axis.init_start_freq) {
        console.log("处理超过最小值", minValue)
        minValue = this.options.x_axis.init_start_freq;
        maxValue = Math.floor(minValue + newfreqStep)
      }
      if (maxValue > this.options.x_axis.init_end_freq) {
        console.log("处理超过最大值", maxValue)
        maxValue = this.options.x_axis.init_end_freq;
        minValue = Math.ceil(maxValue - newfreqStep);
      }
      if (minValue >= this.options.x_axis.init_start_freq && maxValue <= this.options.x_axis.init_end_freq) {

        this.options.x_axis.start_freq = minValue;
        this.options.x_axis.end_freq = maxValue;
        this.scaleX = scaleX;
        if (this.onFreqChangeCallback) {
          //this.scaleX = scaleX;
          console.log("鼠标缩放频率范围", minValue, maxValue)
          this.onFreqChangeCallback(minValue, maxValue)
        }
        console.log("更改视图频率范围", this.options.x_axis.start_freq, this.options.x_axis.end_freq)
        this.drawChart();
      }
    }


    if (this.scaleDirection === 'y' && type == "grid" || this.scaleDirection === 'both' && type == "grid") {
      scaleY *= zoomFactor; // 调整Y轴的缩放比例
      scaleY = scaleY.toFixed(1) - 0

      if (scaleY < 1) {
        scaleY = 1
        this.offsetY = 0
      };
      if (scaleY > 3) scaleY = 3;
      this.scaleY = scaleY;
      this.drawChart();
      // this.updateScrollbar(); // 更新滚动条位置
    }








  }
  /**
   * 获取鼠标位置对应的值
   * @param {*} event 
   * @returns 
   */
  getMouseVal(event) {
    // let pointx = event.offsetX;
    // let pointy = event.offsetY;
    const rect = this.canvas.getBoundingClientRect(); // 获取 Canvas 的位置和大小
    let pointx = event.clientX - rect.left; // 计算鼠标相对于 Canvas 的 X 坐标
    let pointy = event.clientY - rect.top; // 计算鼠标相对于 Canvas 的 Y 坐标
    let x = null; //x轴频率
    let y = null; //y轴频率
    let order = null; //x轴标签组序号
    var freqdiff = this.options.x_axis.end_freq - this.options.x_axis.start_freq;


    if (pointx < this.options.grid.left) {
      x = this.options.x_axis.start_freq;
      order = 0
    } else if (pointx >= this.options.grid.left && pointx <= this.width - this.options.grid.left) {
      x = this.options.x_axis.start_freq + (pointx - this.options.grid.left) / this.chartWidth * freqdiff
      x = Math.floor(x)
      console.log("点频率值", x)
    }
    return {
      x,
      y,
      order
    };
  }
  /**
   * 计算手指中心点值
   * @param {*} event 
   */
  getTouchMouseVal(e) {
    const rect = this.canvas.getBoundingClientRect(); // 获取 Canvas 的位置和大小
    let centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2; // 计算两手指中心点的X坐标
    let centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2; // 计算两手指中心点的X坐标

    let pointx = centerX - rect.left; // 计算鼠标相对于 Canvas 的 X 坐标
    let pointy = centerY - rect.top; // 计算鼠标相对于 Canvas 的 Y 坐标
    let x = null; //x轴频率
    let y = null; //y轴频率
    let order = null; //x轴标签组序号
    var freqdiff = this.options.x_axis.end_freq - this.options.x_axis.start_freq;
    if (pointx < this.options.grid.left) {
      x = this.options.x_axis.start_freq;
      // this.showconsole({
      //   point: pointx,
      //   "type": "小于左边界" + this.options.grid.left
      // })
      order = 0
    } else if (pointx >= this.options.grid.left && pointx <= this.width - this.options.grid.left) {
      x = this.options.x_axis.start_freq + (pointx - this.options.grid.left) / this.chartWidth * freqdiff
      x = Math.floor(x)
      console.log("点频率值", x)
      // this.showconsole({
      //   point: pointx,
      //   "type": "获取手指中心频率",
      //   "freq": x
      // })
    }
    return {
      x,
      y,
      order
    };
  }
  /**
   * 获取当前鼠标所在位置频率和强度
   * @param {*} event 
   */
  getMousePoint(event) {
    const rect = this.canvas.getBoundingClientRect(); // 获取 Canvas 的位置和大小
    let pointx = event.clientX - rect.left; // 计算鼠标相对于 Canvas 的 X 坐标
    let pointy = event.clientY - rect.top; // 计算鼠标相对于 Canvas 的 Y 坐标
    return {
      pointx,
      pointy
    }
  }

  /**
   * 获取鼠标当前区域
   * @param {*} event 
   * @returns 
   */
  getMousePosition(events) {
    var event = window.event;
    const rect = this.canvas.getBoundingClientRect(); // 获取 Canvas 的位置和大小
    const x = event.clientX - rect.left; // 计算鼠标相对于 Canvas 的 X 坐标
    const y = event.clientY - rect.top; // 计算鼠标相对于 Canvas 的 Y 坐标
    var result = ""
    // 检查鼠标是否在 Canvas 内部
    if (x < 0 || x > this.width || y < 0 || y > this.height) {
      result = null;
    } else if (x < this.options.grid.left) {
      result = "left";
    } else if (y < this.options.grid.top) {
      result = "top";
    } else if (x > this.canvas.width - this.options.grid.right) {
      result = "right";
    } else if (y > this.canvas.height - this.options.grid.bottom) {
      result = "bottom";
    } else {
      result = "grid";
    }
    this.focusType = result;
    return result;
  }
  /**
   * 获取频率范围内的业务名称
   * @param {*} start 
   * @param {*} end 
   * @returns 
   */
  getFreqBussiness(datas) {
    let rangeData=this.getRegionData(this.inittreeData.band_list, datas.start, datas.end)
    let names=[];
    for (let i = 0; i < rangeData.length; i++) {
      if (rangeData[i].business_id) {
        names.push(this.getItemText(rangeData[i].business_id))
      }else if(this.options.type==1&&rangeData[i].business&&rangeData[i].business.length>0){
        for (let j = 0; j < rangeData[i].business.length; j++) {
          names.push(this.getItemText(rangeData[i].business[j].business_id))
        }
      }
    }
    console.log("获取频率范围内的业务名称", rangeData)
    return this.uniqueChinese(names)
  }
  uniqueChinese(arr) {
    var hashMap = Object.create(null); // 创建空对象，无原型链更高效
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      if (!hashMap[item]) {          // 哈希表直接查询
        hashMap[item] = true;        // 标记存在状态
        result.push(item);
      }
    }
    return result;
  }
  /**
   * 获取配置
   */
  getOptions() {
    return this.options;
  }
  /**
   * 设置频率回调
   * @param {*} callback 
   */
  onFreq(callback) {
    this.onFreqChangeCallback = callback;
  }
  /*
   * 设置点击回调
   * @param {*} callback
   */
  onClick(callback) {
    this.onClickGridCallback = callback;
  }
  /**
   * 设置按键回调
   * @param {*} callback 
   */
  onKey(callback) {
    this.onKeyCallback = callback;
  }
  /**
   * 设置缩放回调
   */
  onClickZoom(callback) {
    this.onClickZommCallback = callback;
  }
  /**
   * 设置焦点回调
   */
  onFocus(callback) {
    this.onFocusCallback = callback
  }
  /**
   * 设置切换回调
   */
  onSwitch(callback) {
    this.onSwitchCallback = callback
  }
  /**
   * 更新配置项
   * @param {*} options
   *  
   */
  updateOptions(options) {
    let newoptions = deepMerge(this.options, options);
    this.initOptions(newoptions,"update");
    this.drawChart();
  }
  /**
   * 设置树数据
   * @param {*} datas
   */
  setChartData(datas) {
    this.initDefault();
    this.readJsonData(datas);
    this.drawChart();
  }
  /**
   * 设置初始频率范围
   * @param {*} datas 
   */
  setInitFreqRange(datas) {
    if (datas.start && datas.end) {
      this.initDefault();
      this.options.x_axis.init_start_freq = datas.start;
      this.options.x_axis.init_end_freq = datas.end;
      this.options.x_axis.start_freq = datas.start;
      this.options.x_axis.end_freq = datas.end;
      this.drawChart()
    } else {
      console.log("请输入正确的初始频率范围")
    }
  }
  /**
   * 对外方法
   * 设置频率范围
   */
  setfreqRange(datas) {
    if (datas.start && datas.end) {
      let start_freq = datas.start;
      let end_freq = datas.end;
      if (start_freq == this.options.x_axis.init_start_freq && end_freq == this.options.x_axis.init_end_freq) {
        //初始绘制频率
        this.initDefault();
      }
      this.options.x_axis.start_freq = start_freq;
      this.options.x_axis.end_freq = end_freq;
      this.drawChart()
    } else {
      console.log("请输入正确的频率范围")
    }
  }
  setLoadMask(datas) {
    if (datas) {
      this.loadMask.style.display = "flex";
      this.loadMask.innerText ="...";
    } else {
      this.loadMask.style.display = "none";
    }
  }
  /**
   * 设置锁屏
   * @param {*} datas 
   */
  setLock(datas) {
    if (datas) {
      this.lockBox.style.display = "flex";
      this.lockBox.style.backgroundColor = colorTostring(this.options.lock.background)
      this.lockBox.style.fontSize = this.options.lock.font_size + "px";
      this.lockBox.style.color = colorTostring(this.options.lock.color)
      this.lockBox.innerText = this.options.lock.content;

    } else {
      this.lockBox.style.display = "none";
    }

  }

  setKey(datas) {
    let type = datas.type;
    let action = datas.action;
    if (this.focusInfo.focus == null) {
      if (type == 4) {
        if (this.onFocusCallback) {
          this.onFocusCallback("chart")
        }
        if (this.focusInfo.prefocus && this.focusInfo.prefocus.type == "grid" || this.focusInfo.prefocus && this.focusInfo.prefocus.key == "switch") {
          this.focusInfo.focus = this.focusInfo.prefocus
        } else {
          //焦点图表
          this.focusInfo.focus = {
            "type": "chart",
            "key": -1,
            "column": -1,
            "row": -1
          }
        }

      }
    } else if (type == 0) {
      //上
      if (this.focusInfo.focus.type !== "chart") {
        let x = this.focusInfo.focus.column;
        let y = this.focusInfo.focus.row - 1;
        if (y < 0) {
          x = x - 1;
          if (x < 0) {
            x = this.focusInfo.list.length - 1;
          }
          y = this.focusInfo.list[x].length - 1;
        }
        this.changeFocus(x, y, type)
      }
    } else if (type == 1) {
      //下
      if (this.focusInfo.focus.type !== "chart") {
        let x = this.focusInfo.focus.column;
        let y = this.focusInfo.focus.row + 1
        let maxValue = this.focusInfo.list[x].length - 1;
        if (y > maxValue) {
          x = x + 1;
          if (x > this.focusInfo.list.length - 1) {
            x = 0;
          }
          y = 0;
        }
        this.changeFocus(x, y, type)
      }
    } else if (type == 2) {
      //左
      if (this.focusInfo.focus.type !== "chart") {
        let x = this.focusInfo.focus.column - 1;
        let y = this.focusInfo.focus.row;
        let maxValue = this.focusInfo.list.length - 1;
        if (x < 0) {
          x = maxValue
        }
        let currentRows = this.focusInfo.list[x].length - 1;
        if (y > currentRows) {
          y = currentRows
        }
        this.changeFocus(x, y, type)
      }
    } else if (type == 3) {
      //右
      if (this.focusInfo.focus.type !== "chart") {
        let x = this.focusInfo.focus.column + 1;
        let y = this.focusInfo.focus.row;
        let maxValue = this.focusInfo.list.length - 1;
        if (x > maxValue) {
          x = 0
        }
        let currentRows = this.focusInfo.list[x].length - 1;
        if (y > currentRows) {
          y = currentRows
        }
        this.changeFocus(x, y, type)
      }
    } else if (type == 4) {
      //确定
      console.log("确定4",this.focusInfo.focus)
      if (this.focusInfo.focus.type == "chart") {
        this.changeFocus(0, 0, type)
      } else if (this.focusInfo.focus.type == "button") {
        if (this.focusInfo.focus.key == "zoomin") {
          document.getElementById("zoom_in").click();
        }else if(this.focusInfo.focus.key=="switch"){
          document.getElementById("switch_button").click();
        }

      } else if (this.focusInfo.focus.type == "grid") {
        let orderid = this.focusInfo.focus.key;
        let gridInfo = this.getGridInfo(this.treeData, orderid);
        this.selectedArea = gridInfo
        console.log("gridInfo", gridInfo)
        //回调消息
        if (this.onClickGridCallback) {
          this.onClickGridCallback(gridInfo)
          this.focusInfo.prefocus = this.focusInfo.focus;
          //this.focusInfo.focus = null;
          if (this.onFocusCallback) {
            this.onFocusCallback("")
          }

        }
      }
    } else if (type == 5) {
      //返回
      if (this.focusInfo.focus.type == "chart") {
        this.focusInfo.prefocus = null;
        this.focusInfo.focus = null
        if (this.onFocusCallback) {
          this.onFocusCallback("")
        }
      } else {
        //返回到图表焦点

        this.focusInfo.prefocus = null;
        this.focusInfo.focus = {
          "type": "chart",
          "key": -1,
          "column": -1,
          "row": -1
        }
      }
    } else if (type == 6) {
      //清除
      this.focusInfo.prefocus = this.focusInfo.focus;
      this.focusInfo.focus = null
      if (this.onFocusCallback) {
        this.onFocusCallback("")
      }
    }
    this.drawChart();
  }

  setZoom(datas) {
    if (datas == 2) {
      this.zoomStatus = 2;
      this.zoomBox.style.backgroundImage = 'url("img/down.png")';
    } else {
      this.zoomStatus = 1;
      this.zoomBox.style.backgroundImage = 'url("img/up.png")';
    }
  }
  changeFocus(x, y, type) {
    console.log("切换焦点",x, y, type,this.focusInfo.list)
    if(this.focusInfo.focus){
      this.focusInfo.prefocus = this.focusInfo.focus;
    }
    if (type == "grid") {

    }
    let columns=this.focusInfo.list[x]
    for (let index = 0; index < columns.length; index++) {
      var items = columns[index];
      if(items.row==y){
        this.focusInfo.focus = items
        break;
      }
    }
    
    console.log("赋值焦点",this.focusInfo.focus)
  }
  /**
   * 焦点勾选
   * @returns 
   */
  selcetedFocus() {
    this.clearElmentFocus();
    if (this.focusInfo.focus == null) {
      return false
    }
    if (this.focusInfo.focus.type == "chart" || this.focusInfo.focus.type == "button") {
      if (this.focusInfo.focus.type == "chart") {
        document.getElementById("mycanvas").classList.add("active");
      } else {
        if (this.focusInfo.focus.key == "zoomin") {
          document.getElementById("zoom_in").classList.add("active");
        } else if (this.focusInfo.focus.key == "switch") {
          document.getElementById("switch_button").classList.add("active");
        }
      }

    } else if (this.focusInfo.focus.type == "grid") {
      console.log("点击绘制", this.focusInfo.focus)
    }
  }
  /**
   * 清除焦点active
   * @returns 
   */
  clearElmentFocus() {
    let eleactives = document.querySelectorAll('.active')
    for (let i = 0; i < eleactives.length; i++) {
      eleactives[i].classList.remove('active')
    }
  }
  // 获取二维数组中子数组的最大长度
  getArrMaxLength(arr) {
    // 初始化最大长度为 0
    var maxLength = 0;

    // 遍历二维数组，比较每个子数组的长度
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].length > maxLength) {
        maxLength = arr[i].length;
      }
    }
    // 返回最大长度
    return maxLength;
  }
  /**
   * 获取频率范围
   * @param {*} datas 
   * @returns 
   */
  getFreqRange(datas) {
    var min = Infinity,
      max = -Infinity;
    for (var i = 0; i < datas.length; i++) {
      var item = datas[i];
      if (!item) continue;
      min = Math.min(min, item.start_freq, item.end_freq);
      max = Math.max(max, item.start_freq, item.end_freq);
    }
    return {
      min: min,
      max: max
    }
  }
  /**
   * 布局算法
   * @param {*} events 
   * @returns 
   */

  layoutEvents(events) {
    var tracks = [];
    var SAFE_MARGIN = 1; // 安全边距

    // 使用 slice() 替代扩展运算符实现数组拷贝
    var sorted = events.slice().sort(function (a, b) {
      return a.start_freq - b.start_freq ||
        (b.end_freq - b.start_freq) - (a.end_freq - a.start_freq) ||
        a.end_freq - b.end_freq;
    });
    sorted.forEach(function (event) {
      var merged = false;

      // 替换 for...of 为常规 for 循环
      for (var t = 0; t < tracks.length; t++) {
        var track = tracks[t];
        if (canMergeVerticallys(track, event)) {
          track.push(event);
          merged = true;
          break;
        }
      }

      if (!merged) {
        // 水平轨道优化
        var bestTrack = -1;
        var bestEnd = Infinity;

        // 循环变量改用 var 声明
        for (var i = 0; i < tracks.length; i++) {
          var last = tracks[i][tracks[i].length - 1];
          if (event.start_freq >= last.end_freq - SAFE_MARGIN) {
            if (last.end_freq < bestEnd) {
              bestTrack = i;
              bestEnd = last.end_freq;
            }
          }
        }

        if (bestTrack !== -1) {
          // 自动时间补偿
          var prevEvent = tracks[bestTrack][tracks[bestTrack].length - 1];
          if (prevEvent.end_freq > event.start_freq) {
            prevEvent.end_freq = event.start_freq - SAFE_MARGIN;
          }
          tracks[bestTrack].push(event);
        } else {
          tracks.push([event]);
        }
      }
    });
    // 确保即使只有一条数据也返回二维数组
    if (tracks.length === 1 && tracks[0].length === 1) {
      tracks = [tracks[0]]; // 将单个数组包装在一个新的数组中
    }
    //console.log("算法", tracks)
    return tracks;
  }
  /**
   * 计算排序
   * @param {*} events 
   */
  computSort(events) {
    var sorted = events.slice().sort(function (a, b) {
      return a.start_freq - b.start_freq ||
        (b.end_freq - b.start_freq) - (a.end_freq - a.start_freq) ||
        a.end_freq - b.end_freq;
    });
    //console.log("排序后的事件", sorted)
    return sorted
  }
  // 防抖包装器（私有方法）
  // debounce(fn, delay) {
  //   let timer = null;
  //   return (...args) => {
  //     clearTimeout(timer);
  //     this.showconsole("防抖函数")
  //     console.log("防抖函数", args)
  //     timer = setTimeout(() => fn(...args), delay);
  //   };
  // }
  // 防抖包装器（私有方法）
  // debounce(fn, delay) {
  //   let timer = null;
  //   return (...args) => {
  //     clearTimeout(timer);
  //     this.showconsole("防抖函数")
  //     console.log("防抖函数", args)
  //     timer = setTimeout(() => fn(...args), delay);
  //   };
  // }
  // 防抖：确保函数在最后一次触发后一定时间才执行
  debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // 节流：确保函数在指定时间间隔内只执行一次
  throttle(func, delay) {
    let lastTime = 0;
    return function (...args) {
      const now = new Date().getTime();
      if (now - lastTime >= delay) {
        func.apply(this, args);
        lastTime = now;
      }
    };
  }
  // 销毁实例方法
  destroy() {
    this.canvas.removeEventListener('mousedown', this.mousedown.bind(this));
    this.canvas.removeEventListener('mouseup', this.mouseup.bind(this))
    this.canvas.removeEventListener('mousemove', this.mousemove.bind(this));
    this.canvas.removeEventListener('mouseout', this.mouseout.bind(this))
    this.canvas.removeEventListener('touchstart', this.touchstart.bind(this));
    this.canvas.removeEventListener('touchmove', this.touchmove.bind(this));
    this.canvas.removeEventListener('touchend', this.touchend.bind(this));

    this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.removeEventListener('dblclick', this.handleDblClick.bind(this));
    this.canvas.removeEventListener('click', this.handleClick.bind(this));
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
    window.removeEventListener('keydown', this.handleKeydown.bind(this));
    window.removeEventListener('keyup', this.handleKeyup.bind(this));
    // 监听窗口调整大小
    window.removeEventListener('resize', () => this.resizeCanvas());
    this.treeData = null;
    this.inittreeData = null;
  }
  showconsole(data) {
    if(!this.options.isPrint){
      return false;
    }
    // var nowdragtimes = new Date().getTime()
    var nowdragtimes = ""
    if (typeof data === 'object' && data !== null) {
      data = JSON.stringify(data)
    }
    var reqdata = data.replace(/\s+/g, '')
    var texts = '<p><span>' + nowdragtimes + '</span>' + reqdata + '</p>'
    // $("#consolelogs").append(texts)
    document.getElementById("consolelogs").innerHTML += texts
  }
}


export default freqChart