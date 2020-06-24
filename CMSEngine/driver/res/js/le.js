/*********变量区*********/
var lightEditMode = 0;   //0代表灯效列表，1为帧设置，2为灯效指定设置页面
var Le = {
  "les": null,
  "leData": null,
  "keymap": null
}
$.multilang=window.parent.$.multilang;
//函数入口
$(document).ready(function(){
  initKetBoardImage();
  $("img").attr("draggable","false");
  $.getJSON("device/" + window.parent.CMS.deviceID + "/data/keymap.js", function(json){
    //Le.keymap = json;
    Le.keymap = [];
    for(var item in json){
       if(json[item].LocationCode !== -1){
		  Le.keymap.push(json[item]);
       } 
    }
    if(window.parent.CMS.deviceConfig.AspectRatio) {
      $('#device').device({
        aspectratio: window.parent.CMS.deviceConfig.AspectRatio,
      });
    }
    $('#device').device({"keymap": Le.keymap});
    $('#device').device({
      "display": {
        "default": "#000"
      }
    });
    $.le({
      onDisplay: function(data) {
        $('#device').device({"display": data});
      }
    });
    initUI();
    initUIEvent();
  });
  colorPickerFunc();
  window.parent.setLanguage(false);
});

$(document).click(function(){
  $("#playlist").hide(); 
  $("#breath_frame_setting").hide();
});

function initKetBoardImage() {
  $("#device").empty();
  var str = '';
  str +=  '<img src="device/' + window.parent.CMS.deviceID + '/img/device_outline.png" class="device-outline" />\
  <img src="device/' + window.parent.CMS.deviceID + '/img/device_panel.png" class="device-panel" />\
  <img src="device/' + window.parent.CMS.deviceID + '/img/device_keycap.png" class="device-keycap" />';
  $("#device").append(str);
  disableImgDraggable();
}

//渲染灯效列表
function initUI() {
  Le.les = window.parent.CMS.les; 
  renderThemeLightList();
}

//初始化UI配置
function initUIEvent(){
  keyOperate();
  lightManaging();
  frameManaging();
  lightConfigManaging();
}

//主题灯效列表显示
function renderThemeLightList() {
  $("#con-text").empty();
  var str = "";
  for(var i = 0; i < Le.les.length; i++) {
    if(window.parent.CMS.deviceConfig.DeviceType === "mouse"){
      if(window.parent.CMS.les[i].Type === 2) {
      	str += '<div class="con-text" lightguid="' + Le.les[i].GUID + '">\
          <p class="con-text-p">\
          <input class="con-text-input" type="text" readonly value="' + Le.les[i].Name + '" />\
          </p>';
          str += '<button class="con-text-button">'+$.multilang("le_edit")+'</button>\
          <button class="con-text-copy">'+$.multilang("le_copy")+'</button>\
          <span class="con-text-span">-</span>\
          </div>';
      }
    } else {
      if(window.parent.CMS.les[i].Type !== 2) {
        str += '<div class="con-text" lightguid="' + Le.les[i].GUID + '">\
          <p class="con-text-p">\
          <input class="con-text-input" type="text" readonly value="' + Le.les[i].Name + '" />\
          </p>';
          str += '<button class="con-text-button">'+$.multilang("le_edit")+'</button>\
          <button class="con-text-copy">'+$.multilang("le_copy")+'</button>\
          <span class="con-text-span">-</span>\
          </div>';
      }
    }
  }
  $("#con-text").append(str);
  $('#lamp-con').scrollTop($('#lamp-con')[0].scrollHeight);

  lightOperate();
}

//灯效的操作
function lightOperate(){ 
  //初始化默认灯效
  initDefaultLight();

  //删除灯效配置文件
  $("#lamp-con").find(".con-text-span").click(function(){
    var lightGUID = $(this).parent().attr("lightguid");
    if (lightGUID == Le.leData.GUID) {
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }
    onDeleteLightProfile(lightGUID);
  });

  //进入帧页面
  $("#lamp-con").find(".con-text-button").click(function(){
    $("#lamp-con").find(".con-text-input").removeClass("con-selected"); 
    $("#lamp-con").find(".con-text-p").removeClass("con-selected"); 
    $.le('stop');
    $('#device').device({
      display: {
        default: '#000'
      }
    });
    $("#custom_light").hide();
    $("#animate").show();
    $("#num_row").show();
    lightEditMode = 1;
    var MultiSelectFlag = {
      "flag": true
    }
    $('#device').device({"MultiSelectFlag": MultiSelectFlag})
    var guid = $(this).parent().attr("lightguid");

    renderThemeLightFrameList(guid);
  });

  //触发播放主题灯效
  $("#lamp-con").find(".con-text-p").click(function(){
    $.le('stop');
    $('#device').device({
      display: {
        default: '#000'
      }
    });
    $("#lamp-con").find(".con-text-p").removeClass("con-selected");           
    $(this).addClass("con-selected");
    var guid = $(this).parent().attr("lightguid");  
    window.parent.readLE(guid, function(data) {
      if(!data)
        return;
      Le.leData = data;
      $.le('play', Le.leData);
    });
  });

  //修改名称
  $("#lamp-con").find(".con-text-p").dblclick(function(){ 
    $(this).find(".con-text-input").prop("readonly", false);
    var val = $(this).find(".con-text-input").val();
    $(this).find(".con-text-input").val("").focus().val(val);
  });

  //修改名称成功
  $("#lamp-con").find(".con-text-p").find(".con-text-input").blur(function(){
    var lightName = $(this).val();    
    var lightGUID = $(this).parent("p").parent(".con-text").attr("lightguid");
    if(lightName == "") {
      window.parent.warning($.multilang("le_name_empty"));
      $(this).focus();
      return;
    }

    var flag = true;
    for (var i = 0; i < Le.les; i++) {
      if(lightName == Le.les[i].Name && lightGUID != Le.les[i].GUID) {
        flag = false;
        window.parent.warning($.multilang("le_name_exist"));
        $(this).focus();
        break;
      }
    }

    if (flag) {     
      $(this).prop("readonly", true);           
      for (var i = 0; i < Le.les.length; i++) {
        if(lightGUID == Le.les[i].GUID) {
          Le.les[i].Name = lightName;              
          break;
        }
      }
      Le.leData.Name = lightName;
      window.parent.writeLE(Le.leData.GUID, Le.leData, function(data) {
        for (var i = 0; i < Le.les.length; i++) {
          if (Le.les[i].GUID == Le.leData.GUID) {          
            Le.les[i].Name = Le.leData.Name;
            break;
          }
        }
        window.parent.writeLEList(Le.les);
      });
    }
    $.le('stop');
    $('#device').device({
      display: {
        default: '#000'
      }
    });
    $(this).parent().find(".con-text-p").removeClass("con-selected");
  });

  //复制灯效配置文件
  $("#lamp-con").find(".con-text-copy").click(function(){
    var lightGUID = $(this).parent().attr("lightguid");
    window.parent.readLE(lightGUID, function(data){
        if(!data)
          return;
        Le.leData = data;
        data.GUID=window.getGuid();
        var nameIndex = 1;
        var nameSuffix = data.Name + nameIndex;
        var flag=true;
        while(flag)
        {
          var i = 0;
          for (i;i<Le.les.length;i++) {
            if (nameSuffix === Le.les[i].Name) {
              nameIndex++;
              nameSuffix = data.Name + nameIndex;
              break;
            }
          }

          if(i == Le.les.length)
            flag=false;
        }
          
        data.Name=nameSuffix;
        window.parent.writeLE(data.GUID, data, function(retdata) {
          var newProfileItem = {
            "GUID": data.GUID,
            "Name": data.Name
          }
          Le.les.push(newProfileItem);  
          renderThemeLightList();
        });
      }); 
  });
}


//帧列表显示          
function renderThemeLightFrameList(guid) {
  window.parent.readLE(guid, function(data){
    if(!data)
      return;
    Le.leData = data;
    showFrames();
  }); 
}    

//生成帧列表
function showFrames() {
  var lightData = Le.leData;
  var lightGUID = lightData.GUID;
  var themeLightData = lightData.Frames;
  $("#con-frame").empty();
  $("#animate").attr("lightguid", lightGUID);
  if(themeLightData.length > 0)
    $("#animate").attr("frameindex", themeLightData.length - 1);
    
  var frameStr = '';
  for(var k = 0; k < themeLightData.length; k++) {
    frameStr += '<div class="con-text con-frame">\
    <div class="con-text-key">\
    <span class="up-key"></span>\
    <span class="down-key"></span>\
    </div>\
    <div class="con-text-num">\
    <input type="text" value="'+themeLightData[k].Count+'" onkeypress="if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;"/>\
    </div>';       
    frameStr += '<input class="con-text-name" readonly type="text" value="'+themeLightData[k].Name+'" />' 
    frameStr += '<span class="con-text-span con-text-buttom">-</span>\
    </div>';
  }
  $("#con-frame").append(frameStr);
  $('#lamp_frame').scrollTop( $('#lamp_frame')[0].scrollHeight);
  frameOperate();   
}

//灯效配置列表显示
function renderLightConfig() {
  var lightData = Le.leData;
  var lightConfig = lightData.LEConfigs;  
  $("#con-color").empty();
  if(lightConfig === null)
    return;
  if(Object.prototype.toString.call(lightConfig) === '[object Array]' && lightConfig.length === 0)
    return;
  var lightConfigStr = '';
  if(lightConfig.length > 0) 
    $("#light_setting").attr("lightconfigindex", lightConfig.length - 1);
     
  for (var i = 0; i < lightConfig.length; i++) {
    if(lightConfig[i].Type == 1){           
      lightConfigStr += '<div class="con-color">\
      <div class="con-text-three-num">\
      <input type="text" class="framecount-setting framecount-common" value="'+ lightConfig[i].Count +'" onkeypress="if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;"/>\
      </div>\
      <div class="con-defult">\
      <span class="defult-color" color="'+ lightConfig[i].Color +'"></span>\
      </div>';   
      lightConfigStr += '<p class="con-text-color-name">RGB</p>';     
      lightConfigStr += '<span class="con-text-span con-text-buttom">-</span>\
      </div>';
    } else if(lightConfig[i].Type == 0) {
      lightConfigStr += '<div class="con-color">\
      <div class="con-text-three-num">\
      <input type="text" class="framecount-setting framecount-common" value="'+ lightConfig[i].Count +'" onkeypress="if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;"/>\
      </div>\
      <div class="con-defult">\
      <span class="defult-color" color="'+ lightConfig[i].Color +'"></span>\
      </div>';
      lightConfigStr += '<p class="con-text-color-name">单色</p>';
      lightConfigStr += '<span class="con-text-span con-text-buttom">-</span>\
      </div>';
    } else if(lightConfig[i].Type == 2) {
      lightConfigStr += '<div class="con-color">\
      <div class="con-text-three-num">\
      <input type="text" class="framecount-setting framecount-breath" readonly value="'+ lightConfig[i].Count + '+' + lightConfig[i].StayCount +'" />\
      </div>\
      <div class="con-defult">\
      <span class="defult-color" color="'+ lightConfig[i].Color +'"></span>\
      </div>';   
      lightConfigStr += '<p class="con-text-color-name">呼吸</p>';
      lightConfigStr += '<span class="con-text-span con-text-buttom">-</span>\
      </div>';
    }
  }
  $("#con-color").append(lightConfigStr);
  $('#lightcolor_setting').scrollTop( $('#lightcolor_setting')[0].scrollHeight );
  lightConfigOperate();    
}

//切换灯效文件
function activeThemeLight(guid) {
  window.parent.readLE(guid, function(data){
    if(!data)
      return;
    Le.leData = data;
    $.le('play', Le.leData);
  });
}

//显示灯效配置
function playLightConfig(lightConfigIndex) {
  stopLightConfig();
  var lightData = Le.leData;
  var lightConfig = lightData.LEConfigs;
  var keyArray = lightConfig[lightConfigIndex].Keys;
  var keyColor = lightConfig[lightConfigIndex].Color;
  var lightType = lightConfig[lightConfigIndex].Type;
  keyColor = keyColor.replace("0x","#");
  var config = {};
  if(keyArray === null || ((Object.prototype.toString.call(keyArray) === '[object Array]') && (keyArray.length === 0)))
    return;
  for (var  j = 0; j < keyArray.length; j++) {
    var index = keyArray[j];
    config[index] = keyColor;
  }
  var data = {
    "default": null,
    "config": config
  }
  $('#device').device({"display": data});   
}

//停止显示灯效配置
function stopLightConfig() {
  var data = {
    "default": "#000000",
    "config": null
  }
  $('#device').device({"display": data});
}


function keyOperate(){
  $('#device').device({
    "onSingleSelect": function (keyItem) {
      if (Le.leData === null)
        return;
      var lightData = Le.leData;
      var themeLightData = lightData.Frames;  
      var lightConfig = lightData.LEConfigs;
      var keyColor;
      var locationCode = keyItem.LocationCode;
      
      if(lightEditMode == 1) {   
        var frameIndex = $("#animate").attr("frameIndex");
        if(typeof(frameIndex) != "undefined") {
          frameIndex = parseInt(frameIndex);
          var config = {}
          if(!themeLightData[frameIndex].Data.hasOwnProperty(locationCode)) {
            keyColor = "0xffffff";
            themeLightData[frameIndex].Data[locationCode] = keyColor;                                                    
          } else {
            delete themeLightData[frameIndex].Data[locationCode];                                         
          }
          for(var index in themeLightData[frameIndex].Data) {
            config[index] = themeLightData[frameIndex].Data[index].replace("0x", "#")
          }                  
        }                     
      } else if(lightEditMode == 2) {
        var lightConfigIndex = $("#light_setting").attr("lightconfigindex");
        if(typeof(lightConfigIndex) != "undefined") {
          lightConfigIndex = parseInt(lightConfigIndex);
          locationCode = parseInt(locationCode);
          var locationCodeIndex = lightConfig[lightConfigIndex].Keys.indexOf(locationCode);                  
          var config = {}
          if (locationCodeIndex === -1) {   
            lightConfig[lightConfigIndex].Keys.push(locationCode);                                
          } else {
            lightConfig[lightConfigIndex].Keys.splice(locationCodeIndex, 1);                                    
          }
          for(var i = 0; i < lightConfig[lightConfigIndex].Keys.length; i++) {
            config[lightConfig[lightConfigIndex].Keys[i]] = lightConfig[lightConfigIndex].Color.replace("0x", "#");
          }                  
        }           
      } else {
        return false;
      }
      
      var data = {
        "default": null,
        "config": config
      }
      
      $('#device').device({"display": data});
    }
  });
    
  $('#device').device({
    "onMultiSelect": function (locationCodes) {
      if (Le.leData === null)
        return;
      var lightData = Le.leData;
      var themeLightData = lightData.Frames;  
      var lightConfig = lightData.LEConfigs;
      var keyColor;
      if(lightEditMode == 1) {   
        var frameIndex = $("#animate").attr("frameIndex");
        if(typeof(frameIndex) != "undefined") {
          frameIndex = parseInt(frameIndex);
          var config = {};
          for (var i = 0; i < locationCodes.length; i++) {
            var locationCode = locationCodes[i];                       
            if(!themeLightData[frameIndex].Data.hasOwnProperty(locationCode)) {
              keyColor = "0xffffff";
              themeLightData[frameIndex].Data[locationCode] = keyColor;       
            } else {
              delete themeLightData[frameIndex].Data[locationCode];
            }                             
          }
          for(var index in themeLightData[frameIndex].Data) {
            config[index] = themeLightData[frameIndex].Data[index].replace("0x", "#")
          }                
        }                     
      } else if(lightEditMode == 2) {
        var lightConfigIndex = $("#light_setting").attr("lightconfigindex");
        if(typeof(lightConfigIndex) != "undefined") {
          lightConfigIndex = parseInt(lightConfigIndex);                   
          var config = {};
          for (var i = 0; i < locationCodes.length; i++) {
            var locationCode = locationCodes[i];                      
            var locationCodeIndex = lightConfig[lightConfigIndex].Keys.indexOf(locationCode);   
            if( locationCodeIndex === -1) {   
              lightConfig[lightConfigIndex].Keys.push(locationCode);                                 
            } else {
              lightConfig[lightConfigIndex].Keys.splice(locationCodeIndex, 1);                          
            }  
          }
          for(var i = 0; i < lightConfig[lightConfigIndex].Keys.length; i++) {
            config[lightConfig[lightConfigIndex].Keys[i]] = lightConfig[lightConfigIndex].Color.replace("0x", "#");
          }             
        }                
      } else {
        return false;
      }

      var data = {
        "default": null,
        "config": config
      }
      $('#device').device({"display": data});
    }
  });
    

  $("#num_row").find("li").click(function(){
    var index = $(this).index();  
    var lightData = Le.leData;
    var themeLightData = lightData.Frames;  
    var lightConfig = lightData.LEConfigs;
    var keyColor;
    var config = {};
    var isLight = true; //是否是全面都被点亮,默认全部点亮了
    
    if(lightEditMode == 1) {
      var frameIndex = $("#animate").attr("frameIndex");
      if(typeof(frameIndex) === "undefined") 
        return false;
      frameIndex = parseInt(frameIndex);       
      keyColor = "0xffffff";
      if(index < 6) {
        var startIndex = 22 * index;
        var endIndex = 22 * (index + 1);
        for (var k = startIndex; k < endIndex; k++) {                   
          for (var i = 0; i < $(".device-keylight").length; i++) {
            if($(".device-keylight").eq(i).data("locationcode") == k) {
              if(!themeLightData[frameIndex].Data.hasOwnProperty(k.toString()))
                isLight = false;
            }
          }
        }

        if(!isLight) {
          for (var k = startIndex; k < endIndex; k++) {                   
            for (var i = 0; i < $(".device-keylight").length; i++) {
              if($(".device-keylight").eq(i).data("locationcode") == k) {                          
                themeLightData[frameIndex].Data[k.toString()] = keyColor;                                     
              }
            }
          }
        } else {
          for (var k = startIndex; k < endIndex; k++) {                   
            for (var i = 0; i < $(".device-keylight").length; i++) {
              if($(".device-keylight").eq(i).data("locationcode") == k) {                                
                delete themeLightData[frameIndex].Data[k.toString()];                                           
              }
            }
          }
        }         
      } else if(index === 6) {
        for (var k = 0 ; k < 132; k++) {
          themeLightData[frameIndex].Data[k.toString()] = keyColor;
        } 
      } else if(index === 7) {
        for (var k = 0 ; k < 132; k++) {
          delete themeLightData[frameIndex].Data[k.toString()];
        }
      }

      for(var index in themeLightData[frameIndex].Data) {
        config[index] = keyColor.replace("0x", "#");
      }   
    } else if(lightEditMode == 2) {   
      var lightConfigIndex = $("#light_setting").attr("lightconfigindex");
      if(typeof(lightConfigIndex) === "undefined") 
        return false;
      lightConfigIndex = parseInt(lightConfigIndex);           
      keyColor = lightConfig[lightConfigIndex].Color;
      if(index < 6) {
        var startIndex = 22 * index;
        var endIndex = 22 * (index + 1);
        for (var k = startIndex; k < endIndex; k++) {                   
          for (var i = 0; i < $(".device-keylight").length; i++) {
            if($(".device-keylight").eq(i).data("locationcode") == k) {
              if(lightConfig[lightConfigIndex].Keys.indexOf(k) == -1)
                isLight = false;
            }
          }
        }

        if(!isLight) {
          for (var k = startIndex; k < endIndex; k++) {                   
            for (var i = 0; i < $(".device-keylight").length; i++) {
              if($(".device-keylight").eq(i).data("locationcode") == k && lightConfig[lightConfigIndex].Keys.indexOf(k) == -1) {    
                lightConfig[lightConfigIndex].Keys.push(k);                    
              }
            }
          }
        } else {
          for (var k = startIndex; k < endIndex; k++) {                   
            for (var i = 0; i < $(".device-keylight").length; i++) {
              if($(".device-keylight").eq(i).data("locationcode") == k && lightConfig[lightConfigIndex].Keys.indexOf(k) != -1) {   
                var configKeyIndex = lightConfig[lightConfigIndex].Keys.indexOf(k);
                lightConfig[lightConfigIndex].Keys.splice(configKeyIndex, 1);                                    
              }
            }
          } 
        }
      } else if(index === 6) {
        for (var k = 0 ; k < 132; k++) {
          lightConfig[lightConfigIndex].Keys.push(k);                                        
        }   
      } else if(index === 7) {
        for (var k = 0 ; k < 132; k++) {
          var configKeyIndex = lightConfig[lightConfigIndex].Keys.indexOf(k);
          lightConfig[lightConfigIndex].Keys.splice(configKeyIndex, 1);                                  
        }
      }
      for (var j = 0; j < lightConfig[lightConfigIndex].Keys.length; j++) {
        config[lightConfig[lightConfigIndex].Keys[j]] = keyColor.replace("0x", "#");
      }    
    } else {
      return false; 
    }

    var leData = {
        "default": null,
        "config": config
    }
    $('#device').device({"display": leData});
      
  });
}

//灯效的管理
function lightManaging() {
  //显示导入导出弹框
  $("#show").click(function(){
    if($("#playlist").is(":hidden")) {
      $("#playlist").show();
      return false;
    } else {
      $("#playlist").hide();
    }        
  });
  //增加灯效配置
  $("#lamp-con").find(".addcon").click(function(){
    onAddLightProfile();
  });

  //导出灯效配置文件
  $("#save").click(function(){
    var eleItem = $("#con-text").find(".con-text").find(".con-selected");
    if(eleItem.length > 0) {
      onExportLightProfile();
    } else {
      window.parent.warning($.multilang("le_export_lightfile_warning"));
    }  
  });
     
  //导入灯效配置文件
  $("#open").click(function(){
      onImportLightProfile();
  });
}

/*初始化默认灯效*/
function initDefaultLight(){
  if(Le.les.length > 0) {    
    activeThemeLight(Le.les[Le.les.length - 1].GUID);
    $("[lightguid='" + Le.les[Le.les.length - 1].GUID + "']").find(".con-text-p").addClass("con-selected");
  }
}

//帧管理
function frameManaging() {
  //增加新的帧
  $("#lamp_frame").find(".addcon").click(function(){
    addFrame();
  });

  //返回灯效列表
  $("#frame_bottom").find(".lamp-two-buttom-back").click(function(){
    if ($("#frame_bottom").find(".play-bg").is(":hidden")) {
      $("#frame_bottom").find(".play-stop").hide();
      $("#frame_bottom").find(".play-bg").show();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }

    stopLightFrame();

    $("#animate").hide(); 
    $("#num_row").hide();  
    $("#custom_light").show();
    initDefaultLight();

    lightEditMode = 0;  
    var MultiSelectFlag = {
        "flag": false
    }
    $('#device').device({"MultiSelectFlag": MultiSelectFlag});  
  });

  //预览帧修改后的灯效
  $("#frame_bottom").find(".lamp-two-buttom-play").click(function(){
    if($(this).find(".play-bg").is(":visible")){
      $(this).find(".play-bg").hide();
      $(this).find(".play-stop").show();
      $.le('play', Le.leData);   
    } else {
      $(this).find(".play-stop").hide();
      $(this).find(".play-bg").show();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }       
  });
  
  //进入灯效配置过程
  $("#detail").click(function(){
    if ($("#frame_bottom").find(".play-bg").is(":hidden")) {
      $("#frame_bottom").find(".play-stop").hide();
      $("#frame_bottom").find(".play-bg").show();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }
    $("#lamp_frame").find(".con-text-name").removeClass("con-selected");
    stopLightFrame();
    $("#animate").hide();
    
    $("#light_setting").show();
    lightEditMode = 2; 
    var MultiSelectFlag = {
        "flag": true
    }
    $('#device').device({"MultiSelectFlag": MultiSelectFlag});

    renderLightConfig();
  });

  //动画制作使用说明
  $("#animate_question").click(function(){
  });
}

//所有有关于帧的操作
function frameOperate() {
  //初始化帧
  initDefaultFrame();

  //帧上移
  $("#lamp_frame").find(".up-key").click(function(){
    var frameIndex = parseInt($(this).parent().parent(".con-frame").index());
    moveUpFrame(frameIndex);
  });

  //帧下移
  $("#lamp_frame").find(".down-key").click(function(){
    var frameIndex = parseInt($(this).parent().parent(".con-frame").index());
    moveDownFrame(frameIndex);
  });

  //修改帧播放帧数
  $("#lamp_frame").find(".con-text-num").find(":text").blur(function(){
    var frameIndex = $(this).parent().parent().index();
    var frameCount = $(this).val();
    var lightData = Le.leData;
    var themeLightData = lightData.Frames;         
    themeLightData[frameIndex].Count = parseInt(frameCount);
  });

  //播放某一帧
  $("#lamp_frame").find(".con-text-name").focus(function(){
    var frameIndex = $(this).parent(".con-frame").index();
    $("#animate").attr("frameindex",frameIndex);
    $("#lamp_frame").find(".con-text-name").removeClass("con-selected");
    stopLightFrame();      
    $(this).addClass("con-selected");
    playLightFrame(frameIndex);
    //同时触发修改帧配置
  })

  //删除某一帧
  $("#lamp_frame").find(".con-text-buttom").click(function(){
    var frameIndex = parseInt($(this).parent(".con-frame").index());
    deleteLightFrame(frameIndex);
  });  
}

//初始化帧
function initDefaultFrame() { 
  if(Le.leData.Frames.length > 0) {
    var frameIndex = Le.leData.Frames.length -1;
    playLightFrame(frameIndex);
    $("#con-frame").find(".con-frame").eq(frameIndex).find(".con-text-name").addClass("con-selected");
  }
}

//播放某一灯效的具体帧
function playLightFrame(frameIndex) {     
  var lightData = Le.leData;
  var themeLightData = lightData.Frames;
  var config = {};
  for(var index in themeLightData[frameIndex].Data) {    
    config[index] = "#ffffff";                
  }

  var data = {
    "default": null,
    "config": config
  }
  $('#device').device({"display": data});
}

function stopLightFrame() {
  var data = {
    "default": "#000000",
    "config": null,
  } 
  $('#device').device({"display": data});
}

function lightConfigManaging(){
  //增加新的灯效设置
  $(".con-text-color-li").click(function(){
    var lightData = Le.leData;
    var lightConfig = lightData.LEConfigs;
    var lightConfigIndex = lightConfig.length;
    var color = "0xff0000";
    var colorName = $(this).text();
    var lightType = parseInt($(this).attr("lighttype"));       
    var str = '';
    var lekeys = [];
    jQuery.each(Le.keymap, function(i, val) {
      lekeys[i] = val.LocationCode;
    });  
    if(lightType == 0) {
      var configItem = {
        Keys: lekeys,
        Color: color,
        Type: lightType,
        Count: 1
      }
    } else if(lightType == 1) {
      var configItem = {
        Keys: lekeys,
        Color: color,
        Type: lightType,
        Count: 100
      }
    } else if(lightType == 2) {
      var configItem = {
        Keys: lekeys,
        Color: color,
        Type: lightType,
        Count: 30,
        StayCount: 10
      }
    }
    lightConfig.push(configItem);
    renderLightConfig();
  });
    
  //颜色设置确认保存
  $("#color_select").find(".con-text-save").click(function(){
    var index = parseInt($("#color_select").attr("index"));
    var backgroundColor = "#"+$(".colorpicker_hex").find(":text").val();      
    var keyColor = backgroundColor.replace("#","0x");
    $(".con-color").eq(index).find(".defult-color").css({"background-color": backgroundColor});
    $(".con-color").eq(index).find(".defult-color").attr("color",keyColor);
    $("#color_select").removeAttr("index");
    $("#color_select").hide();
    var lightData = Le.leData;
    lightData.LEConfigs[index].Color = keyColor; 
  });

  //取消颜色设置
  $("#color_select").find(".con-text-cancel").click(function(){
    $("#color_select").removeAttr("index");
    $("#color_select").hide();
  });

  //灯效配置说明
  $("#lightconfig_question").click(function(){
  });

  $("#light_setting_bottom").find(".lamp-play").click(function(){
    if($(this).find(".play-bg").is(":visible")){
      $(this).find(".play-bg").hide();
      $(this).find(".play-stop").show();
      $.le('play', Le.leData);   
    } else {
      $(this).find(".play-stop").hide();
      $(this).find(".play-bg").show();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }              
  });

  //返回帧页面
  $("#light_setting_bottom").find(".lamp-back").click(function(){
    if ($("#light_setting_bottom").find(".play-bg").is(":hidden")) {
      $("#light_setting_bottom").find(".play-stop").hide();
      $("#light_setting_bottom").find(".play-bg").show();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }
    
    stopLightConfig();
    $("#light_setting").hide();        
    $("#animate").show();  
    lightEditMode = 1; 

    initDefaultFrame();
    var MultiSelectFlag = {
      "flag": true
    }
    $('#device').device({"MultiSelectFlag": MultiSelectFlag});
  });

  $("#light_setting_bottom").find(".lamp-save").click(function(){
    if ($("#light_setting_bottom").find(".play-bg").is(":hidden")) {
      $("#light_setting_bottom").find(".play-stop").hide();
      $("#light_setting_bottom").find(".play-bg").show();
      $.le('stop');
    }
    window.parent.writeLE(Le.leData.GUID, Le.leData, function(data) {     
      window.location.reload();
    });
  });
}

// 灯效设置操作
function lightConfigOperate() {
  //初始化灯效指定
  initDefaultLightConfig();

  //灯效设置的颜色显示
  $(".defult-color").each(function(index){
    var configColor = $(".defult-color").eq(index).attr("color");
    if(configColor){
      configColor = configColor.toString().replace("0x","#");
      $(".defult-color").eq(index).css({"background-color":configColor});
    }    
  });

  //设色器打开
  $("#con-color").find(".con-defult").click(function(){
    if($("#color_select").is(":visible")) {
      $("#color_select").removeAttr("index");
      $("#color_select").hide();
    } else {
      $("#color_select").show();
      var index = $(this).parent().index();
      var currentcolor = $(this).children("span").attr("color");
      $("#color_select").attr("index",index);
      $("#colorpickerHolder").ColorPickerSetColor(currentcolor);
      return false;
    }       
  });   

  //呼吸灯效停留帧修改
  $("#lightcolor_setting").find(".framecount-breath").click(function(){
    var breathdata = this.value;
    var breathdataarr = breathdata.split('+');
    $("#frame_count").val(breathdataarr[0]);
    $("#stay_count").val(breathdataarr[1]);
    if($("#breath_frame_setting").is(":visible")) {
      $("#breath_frame_setting").removeAttr("index");
      $("#breath_frame_setting").hide();
    }　else {
      var index = $(this).parent().parent().index();
      $("#breath_frame_setting").attr("index",index);
      $("#breath_frame_setting").show();
      return false;
    }     
  });    

  $("#breath_frame_setting").find(".con-text-breath-submit").click(function(){
    var frameCount = parseInt($("#frame_count").val());
    var stayCount = parseInt($("#stay_count").val());
    var reg = new RegExp("^[1-9][0-9]*$"); 

    if(reg.test(frameCount) && reg.test(stayCount)) {
      var index = parseInt($("#breath_frame_setting").attr("index"));
      var str = frameCount + "+" + stayCount;
      var lightData = Le.leData;
      lightData.LEConfigs[index].Count = frameCount;
      lightData.LEConfigs[index].StayCount = stayCount;       
      $("#breath_frame_setting").hide();
      $("#con-color").find(".framecount-setting").eq(index).val(str);
    } else {
      $("#frame_count").val("");
      $("#stay_count").val("");
      window.parent.warning($.multilang("le_input_warning"));
      return;
    }     
  });

  $("#breath_frame_setting").find(".con-text-breath-cancel").click(function(){
    $("#breath_frame_setting").hide();
  });

  $("#breath_frame_setting").click(function(){
    return false;
  });

  //单色、RGB灯效配置帧修改
  $("#lightcolor_setting").find(".framecount-common").blur(function(){
    var lightData = Le.leData;
    var lightConfig = lightData.LEConfigs;
    var frameCount = $(this).val();  
    var lightConfigIndex = $(this).parent().parent().index();            
    lightConfig[lightConfigIndex].Count = parseInt(frameCount);
  });

  //灯效配置显示
  $(".con-text-color-name").click(function(){
    $(".con-text-color-name").removeClass("con-selected");
    $(this).addClass("con-selected");
    var lightConfigIndex = $(this).parent().index();
    $("#light_setting").attr("lightconfigindex", lightConfigIndex);
    playLightConfig(lightConfigIndex);
  });

  //删除指定的灯效设置
  $("#con-color").find(".con-text-buttom").click(function(){
    var index = $(this).parent().index();        
    var lightData = Le.leData;
    if(lightData.LEConfigs.length <= 1) {
      return;
    }
    lightData.LEConfigs.splice(index, 1);
    $("#con-color").find(".con-color").eq(index).remove();
  });
}

function initDefaultLightConfig() {
  if(Le.leData.LEConfigs.length > 0) {
    var lightConfigIndex = Le.leData.LEConfigs.length - 1;
    $("#con-color").find(".con-color").eq(lightConfigIndex).find(".con-text-color-name").addClass("con-selected");
    playLightConfig(lightConfigIndex);
  }       
}


/*增加灯效配置文件*/
function onAddLightProfile(){
  //获取配置名称后缀
  var nameIndex = Le.les.length + 1;
  var nameSuffix = $.multilang("le_lamp") + nameIndex;
  var flag = true;
  while (flag) {
    var i = 0;
    for (i;i<Le.les.length;i++) {
      if (nameSuffix === Le.les[i].Name) {
        nameIndex++;
        nameSuffix = $.multilang("le_lamp") + nameIndex;
        break;
      }
    }
    if (i == Le.les.length)
      flag = false;
  }
  window.parent.prompt($.multilang("le_prompt"),$.multilang("le_add_lamp"), nameSuffix, function(result, value){
    if (!result) 
      return;
    if (value.replace(/\s+/g,"")=="") {
      window.parent.warning($.multilang("le_name_empty"));
      return false;
    }
    addLightProfile(value);
  });
}

//增加灯效配置文件
function addLightProfile(profilename) {
  //检测新增名称不可重复
  var flag = false;
  for (var i = 0;i < Le.les.length; i++) {
    if(profilename === Le.les[i].Name) {
      flag = true;
      break;
    }
  }
  
  if (flag) {
    window.parent.warning($.multilang("le_file_exist"));
    return false;
  }
  var newProfile = {};
  newProfile.GUID = getGuid();
  newProfile.Name = profilename;
  if(window.parent.CMS.deviceConfig.DeviceType === "mouse"){
    newProfile.Type = 2;
  }

  var keyColor = "#ffffff";
  var configdata = {}
  for (var k = 0 ; k < 132; k++) {
    for (var i = 0; i < $(".device-keylight").length; i++) {
      if($(".device-keylight").eq(i).data("locationcode") == k) {
        configdata[k.toString()] = keyColor;          
      }
    }
  }

  newProfile.Frames = [{
    "Count" : 1,
    "Name" : "frame0",
    "Data" : configdata
  }];
  newProfile.LEConfigs = [];
  window.parent.writeLE(newProfile.GUID, newProfile, function(data) {
    var newProfileItem = {
      "GUID": newProfile.GUID,
      "Name": newProfile.Name,
      "Type": newProfile.Type

    }
    Le.les.push(newProfileItem);
    window.parent.writeLEList(Le.les, function(){ 
      renderThemeLightList();
    });
  });
}

/*删除灯效配置文件*/
function onDeleteLightProfile(lightguid){
  if(Le.les.length == 1) {
    window.parent.alert($.multilang("le_prompt"),$.multilang("le_delete_error"));
    return;
  }

  var fileName = "";    
  for(var i = 0;i< Le.les.length; i++) {
    if(Le.les[i].GUID == lightguid) {
      fileName = Le.les[i].Name;
      break;
    }
  }
  window.parent.confirm($.multilang("le_prompt"), $.multilang("le_delete_confirm") + fileName, function(result){ 
    if (!result)
      return;
    deleteLightProfile(lightguid);
  });       
}

//删除灯效配置文件
function deleteLightProfile(lightguid){
  window.parent.deleteLE(lightguid, function(){
    for (var i = 0; i < Le.les.length; i++) {
      if(Le.les[i].GUID == lightguid) {
        Le.les.splice(i, 1);
        break;
      }
    }
    window.parent.writeLEList(Le.les, function(){ 
      renderThemeLightList();
    });
  },function(faildata){
    for (var i = 0; i < Le.les.length; i++) {
      if(Le.les[i].GUID == lightguid) {
        Le.les.splice(i, 1);
        break;
      }
    }

    renderThemeLightList();
  }
  );
}

/*导出灯效配置文件*/
function onExportLightProfile(){
  //灯效文件导出
  return;
  var newProfile = JSON.parse(JSON.stringify(Le.leData));
  cms('ExportLightfile',{JsonLightfile:JSON.stringify(newProfile)},function(data){});
    
}

/*导入灯效配置文件*/
function onImportLightProfile(){
  return;

  cms('ImportLightfile', {}, function (data){
    var newProfile = JSON.parse(data);
    var common_prompt = $.i18n.prop('common_prompt');
    var common_import_exist = $.i18n.prop('common_import_exist');
    var common_cancel = $.i18n.prop('common_cancel');
    var common_confirm = $.i18n.prop('common_confirm');          
    
    var flag = true;
    for(var j = 0; j < Le.les.length; j++) {
      //配置文件已存在
      if(Le.les[j].GUID === newProfile.GUID) {
        flag = false;
        newProfile.LightName = Le.les[j].LightName;
        window.parent.confirm($.multilang("le_prompt"), $.multilang("le_file_exist"), function(){
          var bResult = window.WriteFile("Lightfile", window.parent.MYAPP.AccoutId, getModelId(), newProfile.GUID, JSON.stringify(newProfile));
          if(bResult) {
            if(Le.leData.GUID === newProfile.GUID) {
              Le.leData = newProfile;
              renderThemeLightList();
            }
          }                 
        });           
      }
    }
    /*灯效文件不存在*/
    if(flag){
      var bResult = window.WriteFile("Lightfile", window.parent.MYAPP.AccoutId, getModelId(), newProfile.GUID, JSON.stringify(newProfile));
      if(bResult) {                 
        var newProfileItem = {
          "GUID": newProfile.GUID,
          "LightName": newProfile.Name
        }
        Le.les.push(newProfileItem);
        renderThemeLightList();
      }
    }
  });
}


//增加新的帧
function addFrame() {
    var lightData = Le.leData;
    var ledFrames = {};
    var themeLightData = lightData.Frames;
    var frameIndex = $("#animate").attr("frameIndex");
    frameIndex = parseInt(frameIndex);
    ledFrames.Count = 1;
    ledFrames.Name = "frame" + lightData.Frames.length;
    var leInitData = [];
    for(var keyinmap in Le.keymap) {
      themeLightData[frameIndex].Data[Le.keymap[keyinmap].LocationCode.toString()] = "#ffffff";    
    }
    if (lightData.Frames.length) {
      ledFrames.Data = clone(lightData.Frames[lightData.Frames.length-1].Data);
    } else {
      ledFrames.Data = {};
    }
    lightData.Frames.push(ledFrames);
    showFrames();
}

//删除当前灯效的具体帧
function deleteLightFrame(frameIndex) {
  var lightData = Le.leData;
  if(lightData.Frames.length <= 1 || frameIndex > lightData.Frames.length - 1) {
    return;
  }
  lightData.Frames.splice(frameIndex, 1);
  if(frameIndex == $("#animate").attr("frameindex")) {
    $("#animate").removeAttr("frameindex")
  }
  $("#con-frame").find(".con-frame").eq(frameIndex).remove();
}

//当前灯效具体帧上移
function moveUpFrame(frameIndex) {
  var lightData = Le.leData;
  if(frameIndex == 0 || lightData.Frames.length <= 1) {
      return;
  }
  var tmp = lightData.Frames[frameIndex];
  var tmp2 = lightData.Frames[frameIndex-1];
  lightData.Frames.splice(frameIndex, 1, tmp2);
  lightData.Frames.splice(frameIndex-1, 1, tmp);
  var node1 = $("#con-frame").find(".con-frame").eq(frameIndex).html();
  var node2 = $("#con-frame").find(".con-frame").eq(frameIndex-1).html();
  $("#con-frame").find(".con-frame").eq(frameIndex).html(node2);
  $("#con-frame").find(".con-frame").eq(frameIndex-1).html(node1);
  frameOperate();
}

//当前灯效具体帧下移
function moveDownFrame(frameIndex) {
  var lightData = Le.leData;
  if(frameIndex >= lightData.Frames.length-1 || lightData.Frames.length <= 1) {
      return;
  }
  var tmp = lightData.Frames[frameIndex];
  var tmp2 = lightData.Frames[frameIndex+1];
  lightData.Frames.splice(frameIndex, 1, tmp2);
  lightData.Frames.splice(frameIndex+1, 1, tmp);
  var node1 = $("#con-frame").find(".con-frame").eq(frameIndex).html();
  var node2 = $("#con-frame").find(".con-frame").eq(frameIndex+1).html();
  $("#con-frame").find(".con-frame").eq(frameIndex).html(node2);
  $("#con-frame").find(".con-frame").eq(frameIndex+1).html(node1);
   
  frameOperate();
}

function colorPickerFunc() {
  $('#colorpickerHolder').ColorPicker({flat: true});
  
  $('#colorpickerHolder2').ColorPicker({
      flat: true,
      color: '#00ff00',
      onSubmit: function(hsb, hex, rgb) {
          $('#colorSelector2 div').css('backgroundColor', '#' + hex);
      }
  });
  $('#colorpickerHolder2>div').css('position', 'absolute');
  var widt = false;
  $('#colorSelector2').bind('click', function() {
      $('#colorpickerHolder2').stop().animate({height: widt ? 0 : 173}, 500);
      widt = !widt;
  });
  
  $('#colorpickerField1, #colorpickerField2, #colorpickerField3').ColorPicker({
      onSubmit: function(hsb, hex, rgb, el) {
          $(el).val(hex);
          $(el).ColorPickerHide();
      },
      onBeforeShow: function () {
          $(this).ColorPickerSetColor(this.value);
      }
  })
  .bind('keyup', function(){
      $(this).ColorPickerSetColor(this.value);
  });
  $('#colorSelector').ColorPicker({
      color: '#0000ff',
      onShow: function (colpkr) {
          $(colpkr).fadeIn(500);
          return false;
      },
      onHide: function (colpkr) {
          $(colpkr).fadeOut(500);
          return false;
      },
      onChange: function (hsb, hex, rgb) {
          $('#colorSelector div').css('backgroundColor', '#' + hex);
      }
  });
}

//js克隆对象
function clone(obj){  
    var o;  
    switch(typeof obj){  
    case 'undefined': break;  
    case 'string'   : o = obj + '';break;  
    case 'number'   : o = obj - 0;break;  
    case 'boolean'  : o = obj;break;  
    case 'object'   :  
        if(obj === null){  
            o = null;  
        }else{  
            if(obj instanceof Array){  
                o = [];  
                for(var i = 0, len = obj.length; i < len; i++){  
                    o.push(clone(obj[i]));  
                }  
            }else{  
                o = {};  
                for(var k in obj){  
                    o[k] = clone(obj[k]);  
                }  
            }  
        }  
        break;  
    default:          
        o = obj;break;  
    }  
    return o;     
}