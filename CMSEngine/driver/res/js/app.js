var CMS = {
  skins: [
    "res/skin/skin1.png",
    "res/skin/skin2.png",
    "res/skin/skin3.png",
    "res/skin/skin4.png",
    "res/skin/skin5.png",
    "res/skin/skin6.png",
  ],
  appConfig: {
    Language: "en",
    Skin: "res/skin/skin1.png",
  },
  userConfig: {
  },
  models: [],
  macros: [],
  les: [],
  devices: [],
  deviceID: 0,
  deviceConfig: null,
  profiles: [],
  defaultProfiles: [],
  currentProfile: null,
  modelWindow: '',
  stdModelApply: false,
  waterfall: null,
  waterfallEnd: null,
};

function resetProfile()
{
  for(var i = CMS.profiles.length-1; i >= 0; i--) {
    deleteProfile(CMS.deviceID, CMS.profiles[i].GUID, function() {
      CMS.profiles.splice(i, 1);
      if (CMS.profiles.length == 0)
        initProfiles(true);
    });
  }
}

function initUI() {
  $("img").attr("draggable", "false");

  initLanguage(CMS.appConfig.Language);
  if (CMS.appConfig.Skin)
    setSkin(CMS.appConfig.Skin);

  $('#header').header({
    onCloseClick: closeCMSUI,
    onMinimizeClick: minimizeCMSUI
  });
  $('#header_logo').imagebutton({
    onClick: function () { openURL(CMS.env.website) }
  });
  $('#header_deviceselect').deviceselect({
    onSelect: onDeviceSelect
  });
  $('#header_sc_skins').imagebutton({
    onClick: function () { openModelWindow('Skins') }
  })
  $('#header_sc_setting').imagebutton({
    onClick: function () { initSettingPage(); openModelWindow('Settings'); }
  })
  $('#model_window').hide();
  $('#model_skins').hide();
  $('#model_settings').hide();
  $('#model_software_update').hide();
  $('#model_skins').skins({
    active: CMS.appConfig.Skin,
    items: CMS.skins,
    onSelect: onSkinsSelect
  });
  $("#soft_update").on('click', function() {
    checkSoftwareUpdate(true);
  });
  $("#firmware_update").on('click', function() {
    return false;
  });
  $("#device_recover").on('click', function() {
    confirm($.multilang('index_set'), $.multilang('index_is_restore_factory'), function(result) {
      if(result) {
        resetProfile();
      }
    })
  });
  
  $("#header").on('mousedown', function(e) {  
    startDrag();
  });

  $(".language-select p").click(function(e){
    if($("#language_select").hasClass("open"))
      $("#language_select").removeClass("open");
    else
      $("#language_select").addClass("open");
    e.stopPropagation();
  });
}

$(document).ready(function() {
  readEnvConfig(function(data) { CMS.env = data; });
  readModelList(function(data) { CMS.models = data; });
  readAppConfig(function(data) {
    if (data) {
      CMS.appConfig = data;
      if(!CMS.appConfig.Language)
        CMS.appConfig.Language = "en";
    if(!CMS.appConfig.Skin)
      CMS.appConfig.Skin = "res/skin/skin1.png";
    }
  });
  readUserConfig(function(data) {
    if (data) {
      CMS.userConfig = data;
    }
    initUI();
    initUserData();
    getDeviceList(onDeviceListChanged);
  });
  
  checkSoftwareUpdate(false);

});

function onProfileActive(onprofileActive)
{
  profileActive(onprofileActive);
}

function checkSoftwareUpdate(automatic) {
  softwareUpdateQuery(function(data) {
    if (data.Type == 1) {
      CMS.appConfig.SoftVersion = "v" + $.utilities.ntoip(data.Data.CurrentVersion);
      if (data.Data.NewVersion > data.Data.CurrentVersion) {
        confirm($.multilang("index_check_software"),$.multilang("index_software_update_confirm_info", $.utilities.ntoip(data.Data.CurrentVersion), $.utilities.ntoip(data.Data.NewVersion)), function(result) {
          if (result) {
            openModelWindow('SoftwareUpdate');
            $("#pom-software-update-info").hide();
            $("#pom-software-f-s").html("0%");
            $(".downloadspeed").find("span").eq(1).html("0kb/s");
            $("#software-bar-fill").css("width","0px");
            softwareUpdate(data.Data.File, function(data) {             
              var updateMsg = data.Data;
              var type = data.Type;
              if(type === 1) {
                $(".bar-fill").css("width",(updateMsg.DownloadSize/updateMsg.TotalSize*520 + "px"));
                $(".pom-software-f-s").text(Math.round((updateMsg.DownloadSize/updateMsg.TotalSize)*10000)/100 + "%");   
                if(updateMsg.Speed/1024<1024)
                    $(".downloadspeed").find("span").eq(1).html((updateMsg.Speed/1024).toFixed(2)+"kb/s");
                else
                    $(".downloadspeed").find("span").eq(1).html((updateMsg.Speed/(1024*1024)).toFixed(2)+"mb/s");
              } else {
                $(".updatestatu").html($.multilang("index_update_error"));
                $(".downloadspeed").find("span").eq(1).html("0kb/s");
                $(".pom-software-update-info").show();
                $(".pom-software-confirm").show();
                $(".pom-software-confirm").click(function(){
                  openModelWindow('');
                });
              }
            });
          }
        });
      } else {
        if (!automatic)
          return;
        window.warning($.multilang("index_software_no_update"));
      }
    } else {
      if (!automatic)
        return;
      window.warning($.multilang("index_net_error"));
    } 
  });

}

function setSkin(file) {
  $("body").css("background", "url(" + file + ")no-repeat");
}

function initLanguage(lang) {
  if (typeof lang != 'string') {
    console.log('初始化语言函数参数类型错误');
  }
  $.multilang({
    path: "res/lang/", 
    mode: "both",
    language:lang, 
    callback: function() {
      initLanguageCallback();
    }
  });
}

function initLanguageCallback() {
  setLanguage(true);}

function setLanguage(callByParent) {
  if(callByParent==true)
  {
    $("[cms-lang]").each(function() {
      $(this).text($.multilang($(this).attr("cms-lang")));
    });
  }
  else
  {
    $('#main').contents().find("[cms-lang]").each(function() {
      $(this).text($.multilang($(this).attr("cms-lang")));
    });
  }
}
function initSettingPage()
{
  $("#currentSoftVersion").text($.multilang("index_version", CMS.appConfig.SoftVersion));

  var currentDeviceName = $.multilang("undefine_device_name");
  for (var i = 0; i<CMS.models.length; i++) 
  {
    if(CMS.models[i].ModelID==CMS.deviceID)
    {
        currentDeviceName = CMS.models[i].Name;
        break;
    }
  }
  $("#currentDeviceName").text($.multilang("index_current_device", currentDeviceName));
  $("#currentLang").text($("[data-value='"+CMS.appConfig.Language+"']").text());
  $("[data-value='"+CMS.appConfig.Language+"']").addClass("selected-check").siblings().removeClass("selected-check");

  $(".language .language-select ul li").click(function(e){
    var _this=$(this);
    $(".language-select > p").text(_this.text());
    _this.addClass("selected-check").siblings().removeClass("selected-check");

    $("#language_select").removeClass("open");
    e.stopPropagation();

    if(_this.attr("data-value")!=CMS.appConfig.Language)
    {
      CMS.appConfig.Language = _this.attr("data-value");
      writeAppConfig(CMS.appConfig);
      location.reload();
    }
  });

  $(document).on('click',function(){
    $("#language_select").removeClass("open");
  });
  $(".settings-close").click(function(){
      $(this).parent().parent(".settings").hide();
      $(this).parent().parent().parent(".model-window").hide();
  });
}
 
function isSupportDevice(modelID) {
  var support = false;
  for(var i = 0; i < CMS.models.length; i++) {
    if (CMS.models[i].ModelID == modelID)
      support = true;
  }
  return support;
}

function getMacroList(macroList, macroItem) {
  for (var i = 0; i < macroList.length; i++) {
    if( (macroList[i].Type == macroItem.Type) &&
        (macroList[i].Name == macroItem.Name))
        return macroList[i];
  }
  return null;
}

function addMacroItem(macroList, macroItem) {
  for (var i = 0; i < macroList.length; i++) {
    if ((macroList[i].Type == macroItem.Type) &&
        (macroList[i].GUID == macroItem.GUID))
      break;
  }
  if (i != macroList.length)
    macroList.push(macroItem);
}

function initUserData() {
  var isWriteConfig = false;
  if (!CMS.userConfig.UserInit)
    CMS.userConfig.UserInit = {};
  if (!CMS.userConfig.UserInit.Macro) {
    CMS.userConfig.UserInit.Macro = true;
    isWriteConfig = true;

    $.getJSON("res/data/macro/macrolist.json", function(data) {

      var macros = data;
      for (var i = 0; i < macros.length; i++) {
        if (macros[i].Type === 0) {
          copyMacro(macros[i].GUID);
          addMacroItem(CMS.macros, macros[i]);
        } else if (macros[i].Type === 1) {
          var macrosSubList = getMacroList(CMS.macros, macros[i]);
          for (var j = 0; j < macros[i].Data.length; j++) {
            if (macros[i].Data[j].Type === 0) {
              copyMacro(macros[i].Data[j].GUID);
              macrosSubList && addMacroItem(macrosSubList, macros[i]);
            }
          }
          !macrosSubList && CMS.macros.push(macros[i]);
        }
      }
      writeMacroList(CMS.macros);
    });
  } else {
    readMacroList(function(json){
      CMS.macros = json;
    });
  }
  if (!CMS.userConfig.UserInit.LE) {
    CMS.userConfig.UserInit.LE = true;
    isWriteConfig = true;

    $.getJSON("res/data/le/lelist_"+CMS.appConfig.Language+".json", function(data) {
       for (var i = 0; i < data.length; i++) {
        copyLE(data[i].GUID);
        CMS.les.push(data[i]);
      }
      writeLEList(CMS.les);
    });
  } else {
    readLEList(function(json){
      CMS.les = json;
    });
  }
  isWriteConfig && writeUserConfig(CMS.userConfig);
}

function initModelData(modelID) {
  var isWriteConfig = false;
  if (!CMS.userConfig.ModelInit)
    CMS.userConfig.ModelInit = {};
  if (!CMS.userConfig.ModelInit[modelID])
    CMS.userConfig.ModelInit[modelID] = {};
  if (!CMS.userConfig.ModelInit[modelID].Macro) {
    CMS.userConfig.ModelInit[modelID].Macro = true;
    isWriteConfig = true;

    $.getJSON("device/" + modelID + "/data/macro/macrolist.json", function(data) {
      CMS.macros = data;
      writeMacroList(CMS.macros);
      for (var i = 0; i < CMS.macros.length; i++) {
        if (CMS.macros[i].Type === 0) {
          copyModelMacro(modelID, CMS.macros[i].GUID);
        } else if (CMS.macros[i].Type === 1) {
          for (var j = 0; j < CMS.macros[i].Data.length; j++) {
            if (CMS.macros[i].Data[j].Type === 0) {
              copyModelMacro(modelID, CMS.macros[i].Data[j].GUID);
            }
          }
        }
      }
    });
  }
  if (!CMS.userConfig.ModelInit[modelID].LE) {
    CMS.userConfig.ModelInit[modelID].LE = true;
    isWriteConfig = true;
    
    $.getJSON("device/" + modelID + "/data/le/lelist.json", function(data) {
       for (var i = 0; i < data.length; i++) {
        copyModelLE(modelID, data[i].GUID);
      }
      getLEList(function(data) {
        CMS.les = data;
      });
    });
  }
  isWriteConfig && writeUserConfig(CMS.userConfig);
}

function onDeviceListChanged(devices) {
  if (CMS.env.debug == 1) {
    openDebugWnd();
    if (devices.length == 0) {
      for (var i = 0; i<CMS.models.length; i++) {
        devices.push({ ModelID: CMS.models[i].ModelID });  
      }
      devices.push({ ModelID: 0});
      devices.push({ ModelID: 1});
    }
  }
  CMS.devices = devices;
  var items = [];
  for(var i = 0; i < CMS.devices.length; i++) {
    var item = {
      deviceID: CMS.devices[i].ModelID,
      src: 'device/' + CMS.devices[i].ModelID + '/device.png',
    };
    if (!isSupportDevice(CMS.devices[i].ModelID))
      item.src = 'res/img/no_support.png';
    items.push(item);
  }
  $('#header_deviceselect').deviceselect({
    items: items
  });
}

function onDeviceSelect(deviceID) {
  CMS.deviceID = deviceID;
  var modelID = deviceID;
  CMS.deviceConfig = null;
  CMS.profiles = [];
  CMS.defaultProfiles = [];
  CMS.stdModelApply = true;
  if(modelID == 0) {
    $('#header_navbar').navbar({
      items: [],
      onSelect: null
    })
    $("#main").attr("src", "no_device.html");
  } else {
    if (!isSupportDevice(modelID)) {
      $('#header_navbar').navbar({
        items: [],
        onSelect: null,
      });
      $("#main").attr("src", "no_support.html");
      return
    }

    CMS.deviceConfig = null;
    $.getJSON("device/" + modelID + "/config.json", function(data) {
      CMS.deviceConfig = data;
      var items = [];
      for(var i = 0; i < CMS.deviceConfig.FuncTable.length; i++) {
        var item = {
          title: $.multilang(CMS.deviceConfig.FuncTable[i].Name),
          compact: CMS.deviceConfig.FuncTable[i].Compact
        };
        if (CMS.deviceConfig.FuncTable[i].Icon === true) {
          if (CMS.deviceConfig.FuncTable[i].Type === 0) {
            switch (CMS.deviceConfig.FuncTable[i].Func) {
              case 'kb_online':
                item.icon = 'res/img/func_mode_1.png';     
                break;
              case 'kb_offline':
                break;
              case 'le':
                item.icon = 'res/img/func_le_1.png';
                break;
              case 'macro':
                item.icon = 'res/img/func_macro_1.png';
                break;
            }
          }
        }
        if (typeof CMS.deviceConfig.FuncTable[i].Icon == 'number') {
          item.icon = CMS.deviceConfig.FuncTable[i].Icon;
        }
        items.push(item);
      }
      $('#header_navbar').navbar({
        items: items,
        onSelect: onFuncSelect
      })
      readModelProfile(modelID, 'profile_offline_std', function(data) { CMS.defaultProfiles[1] = data; });
      readModelProfile(modelID, 'profile_offline_1', function(data) { CMS.defaultProfiles[2] = data; });
      readModelProfile(modelID, 'profile_offline_2', function(data) { CMS.defaultProfiles[3] = data; });
      readModelProfile(modelID, 'profile_offline_3', function(data) { CMS.defaultProfiles[4] = data; });
      readModelProfile(modelID, 'profile', function(data) { 
        if (!data)
          console.log("机型ID：" + modelID + "无默认配置文件");

        CMS.defaultProfiles[0] = data;
      });
      getProfileList(modelID, function(profiles) {
        CMS.profiles = profiles;
        initProfiles(false);
      });
    });
    initModelData(modelID);
  }
}

function initProfiles(bApply) {
  var modeProfile = [];
  for (var i = 0; i < CMS.profiles.length; i++) {
    modeProfile[CMS.profiles[i].ModeIndex] = true;
  }
  if (modeProfile[0])
    $('#header_navbar').navbar(0);
  CMS.waterfall = $.utilities.waterfall();
  $.utilities.waterfall(CMS.waterfall);
  for (var i = 0; i <= 4; i++) {
    if (!modeProfile[i]) {
      var newProfile = null;
      if (CMS.defaultProfiles[i])
        newProfile = JSON.parse(JSON.stringify(CMS.defaultProfiles[i]));
      if (!newProfile)
        newProfile = JSON.parse(JSON.stringify(CMS.defaultProfiles[0]));
      if (!newProfile) {
        console.log("机型ID：" + modelID + "无默认配置文件");
        return;
      }

      newProfile.GUID = getGuid();
      newProfile.ModeIndex = i;
      if (i == 0)
        newProfile.Name = $.multilang('config_name')+"1";
      else if (i == 1)
        newProfile.Name = "标准配置";
      else
        newProfile.Name = "离线配置" + (i - 1);
      if (i == 0)
        newProfile.Active = 1;
      else
        newProfile.Active = 0;
      if (i == 1) {
        var stdProfile = {};
        stdProfile.GUID = newProfile.GUID;
        stdProfile.ModeIndex = newProfile.ModeIndex;
        stdProfile.Name = newProfile.Name;
        stdProfile.Active = newProfile.Active;
        stdProfile.DriverLE = newProfile.DriverLE;
        newProfile = stdProfile;
      }
      (function(profile) {
        writeProfile(CMS.deviceID, profile.GUID, profile, function() {
          var item = {
            Active: profile.Active,
            GUID: profile.GUID,
            ModeIndex: profile.ModeIndex,
            Name: profile.Name,
            Application: profile.Application
          }
          CMS.profiles.push(item);
          if (!bApply && (profile.ModeIndex == 0))
            $('#header_navbar').navbar(0);
          if(bApply && (profile.ModeIndex != 0)) {
            CMS.waterfallEnd = $.utilities.waterfall(CMS.waterfall, function(dtd) {
              apply(CMS.deviceID, profile.GUID, function(result) {
                if(result) {
                  if(dtd == CMS.waterfallEnd)
                    $('#header_navbar').navbar(0);
                  else
                    dtd.resolve();
                } else {
                  error($.multilang("apply_error"));
                }
              });
            });
          }
        });
      })(newProfile);
    }
  }
}

function onFuncSelect(index) {
  if (index < CMS.deviceConfig.FuncTable.length) {
    if (CMS.deviceConfig.FuncTable[index].Disabe === 1){
      $("#main").attr("src", "look_forward.html");
    }else{
      switch (CMS.deviceConfig.FuncTable[index].Type) {
        case 0:
          $("#main").attr("src", CMS.deviceConfig.FuncTable[index].Func + ".html");
          break;
        case 1:
          $("#main").attr("src", "device/" + CMS.deviceID + "/" + CMS.deviceConfig.FuncTable[index].Func + ".html"); 
          break;
      }
    }
  }
}

function openModelWindow(window) {
  switch(window) {
    case 'Skins':
      $('#model_skins').show();
      $('#model_window').show();
      break;
    case 'Settings':
      $('#model_settings').show();
      $('#model_window').show();
      break;
    case 'SoftwareUpdate':
      $('#model_software_update').show();
      $('#model_window').show();
      break;
    default:
      $('#model_skins').hide();
      $('#model_settings').hide();
      $('#model_software_update').hide();
      $('#model_window').hide();
      break;
  }
}

function onSkinsSelect(index) {
  if (index < CMS.skins.length) {
    CMS.appConfig.Skin = CMS.skins[index];
    setSkin(CMS.appConfig.Skin);
    readAppConfig(function(data) {
      if (data)
        data.Skin = CMS.appConfig.Skin;
      else
        data = CMS.appConfig;
      writeAppConfig(data);
    });
  }
  openModelWindow();
}

function addProfile(modelID, name, onAddProfile) {
  var newProfile = JSON.parse(JSON.stringify(CMS.defaultProfiles[0]));
  newProfile.GUID = getGuid();
  newProfile.ModeIndex = 0;
  newProfile.Name = name;
  newProfile.Active = 0;
  writeProfile(modelID, newProfile.GUID, newProfile, function() {
    var item = {
      GUID: newProfile.GUID,
      ModeIndex: 0,
      Name: newProfile.Name,
      Active: 0,
      Application: {
        AppName: "",
        AppPath: ""
      }
    }
    CMS.profiles.push(item);
    onAddProfile(newProfile.GUID);
  });
}

function changeProfile(modelID, newGUID, oldGUID, onChangeProfile) {
  changeCurrentProfile(modelID, newGUID, oldGUID, function() {
    for(var i = 0; i < CMS.profiles.length; i++) {
      if (CMS.profiles[i].GUID == newGUID)
        CMS.profiles[i].Active = 1;
      if (CMS.profiles[i].GUID == oldGUID)
        CMS.profiles[i].Active = 0;
    }
    onChangeProfile(newGUID);
  });
}

function success(message) {
  alertify.success(message);
}

function warning(message) {
  alertify.warning(message);
}

function error(message) {
  alertify.error(message);
}

function alert(title, message) {
  alertify.alert( message);
}

function confirm(title, message, onConfirm) {
  alertify.confirm(title, message,
    function() {
      onConfirm(true);
    },
    function() {
      onConfirm(false);
    });
}

function prompt(title, message, value, onPrompt) {
  alertify.prompt(title, message, value,
    function(evt, value) {
      onPrompt(true, value);
    },
    function() {
      onPrompt(false, '');
    });
}

function ntoip(n) {
  var ip;
  var data = new Array();
  data[0] = (n >>> 24) >>> 0;
  data[1] = ((n << 8) >>> 24) >>> 0;
  data[2] = (n << 16) >>> 24;
  data[3] = (n << 24) >>> 24;
  ip = String(data[0]) + "." + String(data[1]) + "." + String(data[2]) + "." + String(data[3]);
  return ip;
}