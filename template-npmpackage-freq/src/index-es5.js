
/**
 * freqChart 频率分布图控件
 *
 * @class freqChart
 */




var devicePixelRatio =  1;

    var loadOptions="";
    var boxdivs = "";
    var canvasbox = "";
    var ctx = "";
    
    
    var isDraw=true
    var languageCode="2052"//语言
    var chartWidth = 0;//图表宽度
    var chartHeight = 0;//图表高度
    var xLabelGridInfo=[]//x轴标签网格信息
    var inittreeData={};//初始数据
    var options={}
    var optionsChart={}
    // 图像数据
    var isDragging = false;//是否拖动
    var isZooming = false;//是否缩放
    var offsetX = 0;//x轴偏移量
    var offsetY = 0;//y轴偏移量
    var scaleX = 1;//x轴缩放比例
    var scaleY = 1;//y轴缩放比例
    var scaleDirection = "x";// 缩放方向x|y|both
    var selectedArea = null;//选中区域
    // 手指触摸操作
    var touchStartDist = 0;
    var prevTouchDistance = 0;
    var isTouching = false;


    var yZoom=1//y轴缩放比例
    
    var focusType="";//聚焦类型 grid|left|right|bottom|threshold|marker

    var treeDatas=[];

    var canvaswidth=""
    var canvasheight=""

    //鼠标按下事件
    var mousedownInfo={
      isMouseDown:false,
      startX:0,
      startY:0,
      mouseupx:0,
      mouseupy:0,
      button:0
    }
    //鼠标移动事件
    var moveInfo={
      isMove:false,
      preX:0,
      preY:0,
      moveX:0,
      moveY:0
    }





    var optionssss={
      "background":"#fff",
      "type":"FFT",//FFT DScan
      "duration": 50,
      "width":'100%',//画布宽度
      "height": '100%',//画布高度
      "center_freq":200000000,
      "span":2000000,
      "grid":{
        "width":1,
        "color":"#B7B7B7",
        "xgrid_line_dash":[15,5]
      },
      "xaxis":{
        "width":1,
        "unit":"MHz",
        "decimals":4,
        "color":"#333",
        "label_angle":30,//X轴标签倾斜角度
      }
    }
    var tree_datasss={
        "table_name": "中国",
        "format_type": 1,
        "business_list": 
        [
          {
            "business_id": 1,
            "color": "#00FFFF",
            "language":
            [
              {
                "code": 2052,
                "name": "固定"
              },
              {
                "code": 1033,
                "name": "Fixed"
              }
            ]
          },
          {
            "business_id": 2,
            "color": "#FFE4C4",
            "language":
            [
              {
                "code": 2052,
                "name": "移动"
              },
              {
                "code": 1033,
                "name": "Mobile"
              }
            ]
          },
          {
            "business_id": 3,
            "color": "#8A2BE2",
            "language":
            [
              {
                "code": 2052,
                "name": "无线电定位"
              },
              {
                "code": 1033,
                "name": "Radiolocation"
              }
            ]
          },
          {
            "business_id": 4,
            "color": "#FF7F50",
            "language":
            [
              {
                "code": 2052,
                "name": "水上移动"
              },
              {
                "code": 1033,
                "name": "Maritime Mobile"
              }
            ]
          },
          {
            "business_id": 5,
            "color": "#006400",
            "language":
            [
              {
                "code": 2052,
                "name": "广播"
              },
              {
                "code": 1033,
                "name": "Broadcasting"
              }
            ]
          }
        ],
        "band_list": 
        [
          {
            "start_freq": 2190500,
            "end_freq": 2198000,
            "business": 
            [
              {
                "business_id": 4
              }
            ]
          },
          {
            "start_freq": 2198000,
            "end_freq": 2300000,
            "business": 
            [
              {
                "business_id": 1
              },
              {
                "business_id": 2
              },
              {
                "business_id": 3
              }
            ]
          },
          {
            "start_freq": 2300000,
            "end_freq": 2495000,
            "foot_notes": ["CHN4"],
            "business": 
            [
              {
                "business_id": 1
              },
              {
                "business_id": 2	
              },
              {
                "business_id": 5,
                "foot_note": ["5.113"],
                "extend_band":
                [
                  [
                    {
                      "start_freq": 2300000,
                      "end_freq": 2310000,
                      "note":["note0001"]
                    },
                    {
                      "start_freq": 2310000,
                      "end_freq": 2320000,
                      "note":["note0001"]
                    }
                  ],
                  [
                    {
                      "start_freq": 2300000,
                      "end_freq": 2350000,
                      "note":["note0002"]
                    },
                    {
                      "start_freq": 2350000,
                      "end_freq": 2400000,
                      "note":["note0002"]
                    }
                  ]
                ]
              }
            ]
          }
        ],
        "notes_list":
        [
          {
            "note_id": "5.113",
            "language":
            [
              {
                "code": 2052,
                "content": "广播业务使用 2300-2495kHz（1 区为 2498kHz），3200-3400kHz，4750-4995kHz和 5005-5060kHz 频段的条件见 5.16 至 5.20，5.21 和 23.3 至 23.10 款。"
              },
              {
                "code": 1033,
                "content": "xxxxxxxxxxxx"
              }
            ]
          },
          {
            "note_id": "CHN4",
            "language":
            [
              {
                "code": 2052,
                "content": "该频段可有限制地用于无线电定位业务，不得对其他业务产生有害干扰。（2001 年）"
              },
              {
                "code": 1033,
                "content": "xxxxxxxxxxxx"
              }
            ]
          },
          {
            "note_id": "note0001",
            "language":
            [
              {
                "code": 2052,
                "content": "xxxxxxx"
              },
              {
                "code": 1033,
                "content": "xxxxxxxxxxxx"
              }
            ]
          },
          {
            "note_id": "note0002",
            "language":
            [
              {
                "code": 2052,
                "content": "xxxxxxx"
              },
              {
                "code": 1033,
                "content": "xxxxxxxxxxxx"
              }
            ]
          }
        ]
      }
      document.getElementById("onloadclick").onclick=function(){
        alert("ddd")
        //onloadDiv("mycanvas",optionssss,tree_datasss)
      }



function onloadDiv(id,options,treedata) {
    // devicePixelRatio = window.devicePixelRatio || 1;
    devicePixelRatio =  1;
    treeDatas=[];
    loadOptions=options;
    boxdivs = document.getElementById(id);
    boxdivs.style.position = "relative"
    boxdivs.innerHTML = '';
    canvasbox = document.createElement('canvas');
    canvasbox.style.position = "absolute";
    boxdivs.appendChild(canvasbox);
    ctx = canvasbox.getContext('2d');
    ctx.imageSmoothingEnabled = true; // 启用抗锯齿
    
    
    isDraw=true
    languageCode="2052"//语言
    chartWidth = 0;//图表宽度
    chartHeight = 0;//图表高度
    xLabelGridInfo=[]//x轴标签网格信息
    inittreeData={};//初始数据

    // 图像数据
    isDragging = false;//是否拖动
    isZooming = false;//是否缩放
    offsetX = 0;//x轴偏移量
    offsetY = 0;//y轴偏移量
    scaleX = 1;//x轴缩放比例
    scaleY = 1;//y轴缩放比例
    scaleDirection = "x";// 缩放方向x|y|both
    selectedArea = null;//选中区域
    // 手指触摸操作
    touchStartDist = 0;
    prevTouchDistance = 0;
    isTouching = false;


    yZoom=1//y轴缩放比例
    
    focusType="";//聚焦类型 grid|left|right|bottom|threshold|marker

    initOptions(options);
    setCanvasSize();
    if(treedata){
      inittreeData=treedata;
      //initData(treedata)
    }
    canvasbox.addEventListener('mousedown', mousedown.bind(this));
    canvasbox.addEventListener('mouseup',mouseup.bind(this))
    canvasbox.addEventListener('mousemove', mousemove.bind(this));
    canvasbox.addEventListener('mouseout',mouseout.bind(this))
    canvasbox.addEventListener('wheel', handleWheel.bind(this));
    canvasbox.addEventListener('dblclick', handleDblClick.bind(this));
    canvasbox.addEventListener('click', handleClick.bind(this));
    canvasbox.addEventListener('contextmenu', handleContextMenu.bind(this));
    window.addEventListener('keydown', handleKeydown.bind(this));
    window.addEventListener('keyup', handleKeyup.bind(this));
    // 监听窗口调整大小
    window.addEventListener('resize', function(){resizeCanvas()});
    //分布图数据
    

    

    //鼠标按下事件
    mousedownInfo={
      isMouseDown:false,
      startX:0,
      startY:0,
      mouseupx:0,
      mouseupy:0,
      button:0
    }
    //鼠标移动事件
    moveInfo={
      isMove:false,
      preX:0,
      preY:0,
      moveX:0,
      moveY:0
    }
    drawChart()
  }
  /**
   * 设置图表大小
   */
  function setCanvasSize(widths, heights) { 
    var width = widths||optionsChart.width;
    var height = heights||optionsChart.height;
    var containerWidth = boxdivs.clientWidth||400;
    var containerHeight = boxdivs.clientHeight||300;
    // 使用实际像素大小设置 Canvas
    canvasbox.width = width === "100%" ? containerWidth : width;
    canvasbox.height = height === "100%" ? containerHeight: height;

    // 设置 CSS 样式，确保 Canvas 在视觉上保持相应比例
    canvasbox.style.width = width === "100%" ? `${containerWidth}px` : `${width}px`;
    canvasbox.style.height = height === "100%" ? `${containerHeight}px`: `${height}px`;
    canvaswidth =canvasbox.width;
    canvasheight =canvasbox.height;
    //计算图表宽高
    chartWidth=Math.floor(canvaswidth - optionsChart.grid.left - optionsChart.grid.right)
    chartHeight=Math.floor(canvasheight - optionsChart.grid.top - optionsChart.grid.bottom)
    optionsChart.grid.right = canvaswidth - optionsChart.grid.left - chartWidth;
    optionsChart.grid.bottom = canvasheight - optionsChart.grid.top - chartHeight;
    
    // 更新字体大小以适应高分辨率
    //optionsChart.fontSize = `${parseInt(optionsChart.fontSize) * window.devicePixelRatio}px`;
  }
  /**
   * 初始化配置
   * @param {*} options
   * @memberof freqChart
   */
  function initOptions(options) {
    var defaultOptions = {
      "type": "1",//图表类型 1 2
      "width": 400,//画布宽度
      "height": 300,//画布高度
      "background": "#CCCCCC",//背景色
      "center_freq": "",//中心频率
      "span": "",//显宽
      "grid":{//网格样式
        "left": 50,//左边距
        "top": 40,//上边距
        "bottom": 50,//下边距
        "right": 40,//右边距
        "color": "#B7B7B7",//网格线颜色
        "background":"transparent",//网格背景色
        "width": 1,//网格线宽度
      },
      "xaxis":{ //X轴样式
        "decimals": "",//X轴刻度标签小数位数
        "unit":"",//单位MHz 为空不显示 
        "unit_right": 10, // x轴单位距离图表左侧距离
        "init_start_freq": 10000000,//X轴起始频率
        "init_end_freq": 200000000,//X轴结束频率
        "start_freq": 10000000,//X轴起始频率
        "end_freq": 200000000,//X轴结束频率
        "text_color": "#343434",//X轴文本颜色
        "text_font_size": 12,//X轴文本字体大小
        "text_font_family": "Arial",//X轴文本字体
        "color": "#333",//X轴线颜色
        "width": 1,//X轴线宽度
        "labels": [//*X轴刻度标签
          
        ],//X轴标签
        "label_angle":90,//*X轴刻度标签角度
      },
      "tree_data":{},//数据

    }
    var mergedOptions = deepMerge({}, defaultOptions);
    optionsChart = deepMerge(mergedOptions,options);
    //初始化参数和DPR计算
    optionsChart.grid.left=Math.floor(optionsChart.grid.left*devicePixelRatio);
    optionsChart.grid.bottom=Math.floor(optionsChart.grid.bottom*devicePixelRatio);
    optionsChart.grid.top=Math.floor(optionsChart.grid.top*devicePixelRatio);
    optionsChart.grid.right=Math.floor(optionsChart.grid.right*devicePixelRatio);
    
    xLabelGridInfo=[]//x轴标签网格信息
    
    console.log("初始化配置",optionsChart)
  }
  //初始化数据
  function initData(datas){
    if(!datas){return false}
    var band_list=deepCopy(datas.band_list);
    var bandLeng=band_list.length;
    optionsChart.xaxis.init_start_freq=band_list[0].start_freq;
    optionsChart.xaxis.init_end_freq=band_list[bandLeng-1].end_freq;
    optionsChart.xaxis.start_freq=band_list[0].start_freq;
    optionsChart.xaxis.end_freq=band_list[bandLeng-1].end_freq;
    getRegionData(band_list);
    console.log("区域内数据")
    
  }
  /**
   * 获取区域数据
   * @param {*} datas
   * @returns
   */
  function getRegionData(datas){
    var regionData=[];
    for(var i=0;i<datas.length;i++){
      var data=datas[i];
      var start_freq=data.start_freq;
      var end_freq=data.end_freq
      if(end_freq<=optionsChart.xaxis.end_freq&&end_freq>=optionsChart.xaxis.start_freq){
        regionData.push(data)
      }
    }
    //计算图表初始数据
    calculateItemData(regionData)
    
  }
  /**
   * 计算项宽度数据
   */
  function calculateItemData(datas){
    console.log(chartWidth)
    var freqdiff=optionsChart.xaxis.end_freq-optionsChart.xaxis.start_freq;
    var freqStep=chartWidth/freqdiff;
    var gridData=[];
    for(var i=0;i<datas.length;i++){
      var data=datas[i];
      var start_freq=data.start_freq;
      var end_freq=data.end_freq;
      var start_x=(start_freq-optionsChart.xaxis.start_freq)*freqStep;
      var end_x=(end_freq-optionsChart.xaxis.start_freq)*freqStep;
      var width=end_x-start_x;
      
      data.start_x=start_x;
      data.width=width;
      data.height=chartHeight*scaleY;
      data.type="column";
      data.end_x=end_x;
      data.columnid=i;
      var rows=data.business
      var rowHeight=chartHeight*scaleY/rows.length;
      console.log("start_x",start_x,end_x,width,rowHeight)
      for(var j=0;j<rows.length;j++){
        var row=rows[j];
        row.type="item";
        row.orderid=j;
        row.width=width;
        row.height=rowHeight;
        row.start_x=start_x;
        row.end_x=end_x;
        data.columnid=i;
        row.item_id=j
        row.x=row.start_x+offsetX+optionsChart.grid.left;
        row.y=optionsChart.grid.top+rowHeight*j+offsetY;
        row.color=getItemColor(row.business_id)
        row.text=getItemText(row.business_id)
      }
      gridData.push(data)
    }
    treeDatas=gridData;
    console.log("表格数据",treeDatas)
  }
   /**
   * 绘制图表
   */
   function drawChart(){
    clearCanvas();
    initBackground();
    initData(inittreeData)
    drawAxis();
    drawGrid();
  }
  
  /**
   *清空画布
   */
   function clearCanvas(){
    ctx.clearRect(0, 0, canvaswidth, canvasheight);
  }
  /**
   * 初始化背景
   */
  function initBackground(){
    ctx.fillStyle = optionsChart.background;
    ctx.fillRect(0, 0, canvaswidth, canvasheight);
  }

 


  /**
   * 初始化图表
   */
  function drawAxis(){
    // 绘制x轴
    initdrawData();
    ctx.strokeStyle = optionsChart.xaxis.color;
    ctx.lineWidth = optionsChart.xaxis.width||1;
    ctx.beginPath();
    ctx.moveTo(optionsChart.grid.left, canvasheight - optionsChart.grid.bottom);
    ctx.lineTo(canvaswidth - optionsChart.grid.right, canvasheight - optionsChart.grid.bottom);
    ctx.stroke();

    // 绘制x轴标签
    ctx.fillStyle = optionsChart.xaxis.text_color; 
    ctx.textBaseline = 'top';
    ctx.font = optionsChart.xaxis.text_font_size*devicePixelRatio+"px "+optionsChart.xaxis.text_font_family;
    optionsChart.xaxis.labels.forEach(function (data, index){
      var x = 0;
      var y = canvasheight - optionsChart.grid.bottom + 8;
      var texts = truncateNumber(data.text/1000000, optionsChart.xaxis.decimals);
      if(index==0){
        x = optionsChart.grid.left;
      }else{
        x =canvaswidth- optionsChart.grid.right - ctx.measureText(texts).width;
      }
       
      ctx.fillText(texts, x, y);
      
    })
    //绘制X轴单位
    if(optionsChart.xaxis.unit!==""){
      ctx.fillText(optionsChart.xaxis.unit, canvaswidth-optionsChart.grid.right+optionsChart.xaxis.unit_right, canvasheight - optionsChart.grid.bottom + +optionsChart.xaxis.text_font_size+8);
    }
    // ctx.save(); // 保存当前绘图状态
    //         ctx.translate(x, y); // 原点移动到移动到标签位置
    //         ctx.rotate(angleInRadians); // 应用旋转变换
    //         ctx.fillText(texts, 0, 0); // 绘制旋转后的文字
    //         ctx.restore(); // 恢复上下文状态
    // ctx.textAlign = 'center';
    // var halfWidth = ctx.measureText(texts).width / 2
    
  }
  /**
   * 初始绘制数据
   */
  function initdrawData(){
    //计算x轴标签底部
    var labelxaxis=[{
        offsetx:0,
        text:optionsChart.xaxis.start_freq
      },{
        offsetx:chartWidth+optionsChart.grid.left,
        text:optionsChart.xaxis.end_freq
      }
    ]
    optionsChart.xaxis.labels=labelxaxis;
  }
  /**
   * 绘制网格
   */
  function drawGrid(){
    ctx.fillStyle = optionsChart.grid.background;
    ctx.fillRect(optionsChart.grid.left, optionsChart.grid.top, chartWidth, chartHeight);
    ctx.strokeStyle = optionsChart.grid.color;
    ctx.lineWidth =  optionsChart.grid.width;

    ctx.save();
    ctx.beginPath();
    ctx.rect(
        optionsChart.grid.left,
        optionsChart.grid.top,
        chartWidth,
        chartHeight
    );
    // 裁剪谱线超过图表区域的部分
    ctx.clip(); 
    ctx.beginPath();
    var treeData=treeDatas;
    for(var i=0;i<treeData.length;i++){
      var widths=treeData[i].width;
      var itemArray=treeData[i].business;
      for(var j=0;j<itemArray.length;j++){
        var row=itemArray[j];
        var x=row.x;
        var y=row.y;
        var width=row.width;
        var height=row.height;
        ctx.fillStyle = row.color;
        ctx.fillRect(x, y, width, height);
        // 绘制区域边框
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.strokeRect(x-0.5, y-0.5, width-1, height-1);
        // 绘制文字
        //console.log("绘制项",row)
        drawText(row.text, x, y, width, height);
      }
    }
    // 高亮选中的区域
    if (selectedArea) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      var x = selectedArea.x ;
      var y = selectedArea.y ;
      var width=selectedArea.width;
      var height=selectedArea.height;
      ctx.lineWidth = 3;
      ctx.strokeRect(x-0.5, y-0.5, width-1, height-1);
    }

    ctx.stroke();
    ctx.restore();
  }




  /**
   * 绘制线
   * @param {*} datas 谱线数据
   */
  function drawLine(data){
    ctx.save();
    ctx.beginPath();
    ctx.rect(
        optionsChart.grid.left,
        optionsChart.grid.top,
        chartWidth,
        chartHeight
    );
    // 裁剪谱线超过图表区域的部分
    ctx.clip(); 
    ctx.beginPath();
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width || 1;

    
    ctx.stroke();
    ctx.restore();

    
  }
  /**
   * 获取频谱图颜色
   * @param {*} id 
   */

  function getItemColor(id){
    var listdata=inittreeData.business_list;
    var color="#000000";
    for(var i=0;i<listdata.length;i++){
      if(listdata[i].business_id==id){
        color=listdata[i].color;
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
  function getItemText(id){
    var listdata=inittreeData.business_list;
    var text="";
    for(var i=0;i<listdata.length;i++){
      if(listdata[i].business_id==id){
        var languagelist=listdata[i].language;
        for(var j=0;j<languagelist.length;j++){
          if(languagelist[j].code==languageCode){
            text=languagelist[j].name;
            break;
          }
        }
      }
    }
    return text
  }
  
  // 绘制区域中的文字
  function drawText(text, x, y, width, height) {
    var fontSize = 16;
    ctx.font = fontSize+"px Arial";
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var textWidth = ctx.measureText(text).width;

    // 文字显示方式
    if (width >= textWidth) {
      // 如果宽度足够，一行显示文字并居中
      ctx.fillText(text, x + width / 2, y + height / 2);
    } else if (width >= fontSize * 2) {
      // 如果宽度不足以显示一行文字但足够显示两行
      var lineHeight = fontSize * 1.2;
      var maxLines = Math.floor(height / lineHeight);
      var lines = splitText(text, width,maxLines);
      
      var totalHeight = lines.length * lineHeight;
      var startY = y + height / 2 - totalHeight / 2+lineHeight/2;
      for (var index = 0; index < lines.length; index++) {
        var line = lines[index];
        ctx.fillText(line, x + width / 2, startY + index * lineHeight);
      }
    } else {
      // 如果宽度不足以显示两行文字，文字竖直显示
      var maxHeight = height - 10; // 留点边距
      var maxLines = Math.floor(maxHeight / fontSize);
      if(maxLines==0){
        return;
      }
      var lines = splitText(text, fontSize, maxLines);

      var startY = y + height / 2 - lines.length * fontSize / 2;
      for (var index = 0; index < lines.length; index++) {
        var line = lines[index];
        ctx.fillText(line, x + width / 2, startY + index * fontSize);
      }
    }
  }

  // 处理文本的拆分
  function splitText(text, maxWidth, maxLines = Infinity) {
    var lines = [];
    var currentLine = '';

    for (var i = 0; i < text.length; i++) {
      var testLine = currentLine + text[i];
      var testWidth = ctx.measureText(testLine).width;

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
    if(maxLines==0){
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
  /**
   * 加载数据
   * @param {*} id 谱线id
   * @param {*} data 谱线数据
   */
  
  function onloadData(data){
    // inittreeData=data;
    // drawChart(data);
  }
  /**
   * 设置频率数据
   * @param {*} id 谱线id
   * @param {*} data 谱线数据
   */
  
  function setTreeData(id,data){
    
    // isDraw=true
    // drawChart();
  }
  

  //监听手指触摸操作
  /**
   * 
   * @param {*} e 
   */
  function touchstart(e) {
    if (e.touches.length == 2) {
      isTouching = true;
      var touch1 = e.touches[0];
      var touch2 = e.touches[1];
      touchStartDist = Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);
      prevTouchDistance = touchStartDist;
    }
  }
  //监听手指触摸移动
  /**
   * 移动
   * @param {*} e 
   */
  function touchmove(e){
    if (isTouching && e.touches.length == 2) {
      var touch1 = e.touches[0];
      var touch2 = e.touches[1];
      var touchDist = Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);
  
      // 计算触摸移动的缩放因子
      var scaleChange = touchDist / prevTouchDistance;
      if (scaleDirection === 'x' || scaleDirection === 'both') {
        scaleX *= scaleChange;
      }
      if (scaleDirection === 'y' || scaleDirection === 'both') {
        scaleY *= scaleChange;
      }
  
      // 防止缩放过小或过大
      if (scaleX < 0.5) scaleX = 0.5;
      if (scaleX > 3) scaleX = 3;
      if (scaleY < 0.5) scaleY = 0.5;
      if (scaleY > 3) scaleY = 3;
  
      // 更新触摸的上一距离
      prevTouchDistance = touchDist;
      drawMap();  // 重新绘制地图
    }
  }
  //监听手指触摸结束
  /**
   * 触摸结束
   * @param {*} e
   */
  function touchend(){
    if (e.touches.length < 2) {
      isTouching = false;
      prevTouchDistance = 0;
    }
  };
  
  //监听事件
  /**
   * 鼠标按下事件
   * @param {*} event 
   */
  function mousedown(event) {
    mousedownInfo={
      isMouseDown:true,
      startX:event.offsetX,
      startY:event.offsetY,
      mouseupx:0,
      mouseupy:0,
      button:event.button
    }
    if (event.button === 0) { // 左键
        // isDragging = true;
        // startY = event.clientY;
        ctx.canvasbox.style.cursor = 'grabbing';
    } else if (event.button === 2) { // 右键
        ctx.canvasbox.style.cursor = 'grab';
    }
  }
  /**
   * 鼠标松开事件
   * @param {*} event
   */
  function mouseup(event) {
    
    var mousedowinfo={
      isMouseDown:false,
      mouseupx:event.offsetX,
      mouseupy:event.offsetY,
      button:event.button
    }
    // mousedownInfo={
    //   ...mousedownInfo,
    //   ...mousedowinfo
    // }
    ctx.canvasbox.style.cursor = 'default';
  }
  /**
   * 鼠标移动
   * @param {*} event 
   */
  function mousemove(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    if (mousedownInfo.isMouseDown) {
      if(moveInfo.preX==0){
        moveInfo.preX = mousedownInfo.startX;
        moveInfo.preY = mousedownInfo.startY;
      }
      var moveX = event.offsetX - moveInfo.preX;
      var moveY = moveInfo.preY-event.offsetY;
      var moveDirX = event.offsetX - mousedownInfo.startX;
      var moveDirY = event.offsetY - mousedownInfo.startY;
      var moveDir = "horizontally";
      // 判断移动方向
      if (Math.abs(moveDirX) > Math.abs(moveDirY)) {
          moveDir = "horizontally";
          var mouseVal=getMouseVal(event);
          
          
      } else {
          moveDir = "vertically";
         
      }
      // 鼠标按下移动
      if (mousedownInfo.button === 0) { // 左键
        
      } else if (mousedownInfo.button === 2) { // 右键
        
      }
    }else{
      // 鼠标移动
      var type=getMousePosition()
      if(type=="grid"){
        var point=getMousePoint(event);
        //设置鼠标移动坐标
       //drawChart();
      }else{
        
      }
      
    }
    moveInfo={
      isMove:true,
      preX:event.offsetX,
      preY:event.offsetY,
      moveX:event.offsetX,
      moveY:event.offsetY
    }
  }
  /**
   * 鼠标移出控件
   * @param {*} event 
   */
  function mouseout(event){
    event.preventDefault();
    mousedownInfo.isMouseDown=false
    moveInfo={
      isMove:false,
      preX:0,
      preY:0,
      moveX:0,
      moveY:0
    }
  }
  /**
   * 鼠标滚轮事件
   * @param {*} event
   * 
   */
  function handleWheel(event) {
    event.preventDefault(); // 阻止默认滚动行为
    var delta = event.deltaY < 0 ? 1 : -1; //下滚缩小，上滚放大
    //var delta = Math.sign(event.deltaY);
    handleZoom(event,delta);
  }
  /**
   * 双击事件
   * @param {*} event 
   */
  function handleDblClick(event) {
    console.log("handleDblClick", event);
  }
  /**
   * 点击事件
   * @param {*} event 
   */
  function handleClick(event) {
    console.log("handleClick", event);
    var points=getMousePosition(event)
    console.log("points",points);
  }
  /*
   * 鼠标右键事件
   * @param {*} event
   */
  function handleContextMenu(event) {
    console.log("handleContextMenu", event);
  }
  /**
   * 按键按下事件
   * @param {*} event
   */
  function handleKeydown(event) {
    //console.log("handleKeydown", event);
    switch (event.keyCode) {
      case 37: // 左箭头
        console.log("左箭头");
        break;
      case 38: // 上箭头
        console.log("上箭头");
        changeThreshold(+0.5)
        break;
      case 39: // 右箭头
        console.log("右箭头");
        break;
      case 40: // 下箭头
        changeThreshold(-0.5)
      default:
        break;
    }
  }
  /**
   * 按键松开事件
   * @param {*} event 
   */
  function handleKeyup(event) {
    console.log("handleKeyup按键松开事件", event);
    switch (event.keyCode) {
      case 37: // 左箭头
        console.log("左箭头松开");
        break;
      case 38: // 上箭头
        console.log("上箭头松开");
        optionsChart.threshold.is_mouse=false;
        break;
      case 39: // 右箭头
        console.log("右箭头松开");
        break;
      case 40: // 下箭头
        console.log("下箭头松开");
        optionsChart.threshold.is_mouse=false;
      default:
        break;
    }
  }


  /**
   * 窗口大小改变事件
   */
  function resizeCanvas() {
    setCanvasSize(); // 重新设置 Canvas 尺寸
    //drawChart(); // 重新绘制图表以适应新尺寸
  }
  /**
   * 设置图表大小
   * @param {*} widhts 宽度
   *  @param {*} heights 高度
   */
  function setChartSize(widths, heights){
    if(widths&&heights){
      optionsChart.width=widths
      optionsChart.height=heights
    }
    setCanvasSize(widths, heights)
    //drawChart(); // 重新绘制图表以适应新尺寸
  }
  
  /**
   * 缩放事件
   * @param {*} event 
   * @param {*} types 
   * @param {*} delta 
   * @returns 
   */
  function handleZoom(event,delta) {
    var type=getMousePosition()
    //console.log("handleZoom",event, delta,type);
    var zoomFactor = 1.1;// 缩放因子
    
    if(type=="left"){
      
     }else if(type=="bottom"){
      
      
    }
    
    //drawChart();
  }
  /**
   * 获取鼠标位置对应的值
   * @param {*} event 
   * @returns 
   */
  function getMouseVal(event,digit=0){
    // var pointx = event.offsetX;
    // var pointy = event.offsetY;
    var rect = canvasbox.getBoundingClientRect(); // 获取 Canvas 的位置和大小
    var pointx = event.clientX - rect.left; // 计算鼠标相对于 Canvas 的 X 坐标
    var pointy = event.clientY - rect.top; // 计算鼠标相对于 Canvas 的 Y 坐标
    var x=null;//x轴频率
    var y=null;//y轴频率
    var order =null;//x轴标签组序号
    
    return {x,y,order};
  }
  /**
   * 获取当前鼠标所在位置频率和强度
   * @param {*} event 
   */
  function getMousePoint(event,digit=0){
    var rect = canvasbox.getBoundingClientRect(); // 获取 Canvas 的位置和大小
    var pointx = event.clientX - rect.left; // 计算鼠标相对于 Canvas 的 X 坐标
    var pointy = event.clientY - rect.top; // 计算鼠标相对于 Canvas 的 Y 坐标
    return{pointx,pointy}
  }

  /**
   * 获取鼠标当前区域
   * @param {*} event 
   * @returns 
   */
  function getMousePosition(events) {
    var event = window.event;
    var rect = canvasbox.getBoundingClientRect(); // 获取 Canvas 的位置和大小
    var x = event.clientX - rect.left; // 计算鼠标相对于 Canvas 的 X 坐标
    var y = event.clientY - rect.top; // 计算鼠标相对于 Canvas 的 Y 坐标
    var result=""
    // 检查鼠标是否在 Canvas 内部
    if (x < 0 || x > canvaswidth || y < 0 || y > canvasheight) {
        result=null;
    }else if (x < optionsChart.grid.left) {
        result="left";
    } else if (y < optionsChart.grid.top) {
        result="top";
    } else if (x > canvasbox.width - optionsChart.grid.right) {
        result="right";
    } else if (y > canvasbox.height - optionsChart.grid.bottom) {
        result="bottom";
    } else {
        result="grid";
    }
    focusType=result;
    return result;
  }
  /**
   * 获取配置
   */
  function getOptions(){
    return options;
  }
  /**
   * 设置配置项
   * @param {*} options 
   */
  function setOptions(options){
    var newoptions = deepMerge(options,options);
    initOptions(newoptions);
  }
































/**
 * 深度合并对象
 * @param {*} target 目标对象
 * @param {*} source 源对象
 * @returns 
 */
function deepMerge(target, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && !Array.isArray(target[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

//拷贝
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
/**
 * 获取设备像素比 (DPR)
 * @returns {number} 当前设备的设备像素比
 */
function getDevicePixelRatio() {
  return window.devicePixelRatio || 1; // 如果没有定义，则返回 1
}




/**
 * 截取数字的小数点后指定的位数（支持负数，且不足位数补零）
 * @param {number} num - 要格式化的数字
 * @param {number} decimalPlaces - 要保留的小数位数
 * @param {boolean} isnum - 是否为数字
 * @returns {number} 截取后的小数位数的数字
 */
function truncateNumber(num, decimalPlaces,isnum=false) {
  // 处理无效输入
  if (isNaN(num) || isNaN(decimalPlaces)) {
      console.log("ddd");
  }
  if(decimalPlaces === ""){
    return num
  }
  // 确保小数位数为正整数
  decimalPlaces = Math.max(0, Math.floor(decimalPlaces));

  // 将数字乘以10的decimalPlaces次方并截取
  var factor = Math.pow(10, decimalPlaces);
  var truncated = Math.trunc(num * factor) / factor; // 截取
  if(isnum){
    //返回浮点数，确保尾数正确
    return parseFloat(truncated.toFixed(decimalPlaces));
  }else{
    // 返回字符串，确保尾数正确
    return truncated.toFixed(decimalPlaces)
  }
  
}