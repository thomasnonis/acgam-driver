
var cms = {
  accountID: 0,
}

function callCMS(name, param, onSuccess, onFailure) {
  var request = { funcname: name };
  for(var i in param) request[i] = param[i];
  var data = { request: JSON.stringify(request) };
  onSuccess && (data.onSuccess = onSuccess);
  data.onFailure = function(code, message) {
    if (onFailure)
      onFailure(code, message);
    console.log('Call CMS failure! code: ' + code + ', message: ' + message);
  };
  window.callFunc(data);
}

function onCMS(name, onFunc) {
  window.onFunc(name, onFunc);
}

function profileActive(onProfileActive){
	if(onProfileActive) {
    onCMS('onProfileActive', function(data) {
		console.log(data);
      var suqData = JSON.parse(data);
      onProfileActive(suqData);
    });
  }
}

function softwareUpdateQuery(onSoftwareUpdateQuery) {
  if(onSoftwareUpdateQuery) {
    onCMS('onSoftwareUpdateQuery', function(data) {
      var suqData = JSON.parse(data);
      onSoftwareUpdateQuery(suqData);
    });
    callCMS('SoftwareUpdateQuery');
  }
}

function softwareUpdate(file, onSoftwareUpdate) {
  if(onSoftwareUpdate) {
    onCMS('onSoftwareUpdate', function(data) {
      var suData = JSON.parse(data);
      onSoftwareUpdate(suData);
    });
    var param = {
      File: file,
    };
    callCMS('SoftwareUpdate', param);
  }
}

function getDeviceList(onDeviceListChanged) {
  if(onDeviceListChanged) {
    onCMS('onDeviceListChanged', function(data) {
      var devices = JSON.parse(data);
      if(devices === null)
        onDeviceListChanged([]);
      else
        onDeviceListChanged(devices);
    });
  }
  callCMS('GetDeviceList');
}

function getProfileList(modelID, onProfileList) {
  if(onProfileList) {
    var param = {
      AccoutID: cms.accountID,
      ModelID: modelID,
    };
    callCMS('GetProfileList', param, function(data) {
      var profiles = JSON.parse(data);
      if(profiles === null)
        onProfileList([]);
      else
        onProfileList(profiles);
    });
  }
}

function readProfile(modelID, guid, onReadProfile) {
  if(onReadProfile) {
    var param = {
      AccoutID: cms.accountID,
      ModelID: modelID,
      GUID: guid,
    }
    callCMS('ReadProfile', param, function(data) {
      var profile = JSON.parse(data);
        onReadProfile(profile);
    });
  }
}

function writeProfile(modelID, guid, profile, onWriteProfile) {
  if(onWriteProfile) {
    var param = {
      AccoutID: cms.accountID,
      ModelID: modelID,
      GUID: guid,
      Data: JSON.stringify(profile),
    }
    callCMS('WriteProfile', param, function() {
      onWriteProfile();
    });
  }
}

function deleteProfile(modelID, guid, onDeleteProfile) {
  if(onDeleteProfile) {
    var param = {
      AccoutID: cms.accountID,
      ModelID: modelID,
      GUID: guid,
    }
    callCMS('DeleteProfile', param,
      function() {
        onDeleteProfile(true);
      },
      function() {
        onDeleteProfile(false);
      });
  }
}

function changeCurrentProfile(modelID, newGUID, oldGUID, onChangeProfile) {
  if(onChangeProfile) {
    var param = {
      AccoutID: cms.accountID,
      ModelID: modelID,
      NewGUID: newGUID,
      OldGUID: oldGUID,
    }
    callCMS('ChangeCurrentProfile', param, function() {
      onChangeProfile();
    });
  }
}

function changeMode(modelID, modeIndex) {
  if (modeIndex) {
    var param = {
      ModelID: modelID,
      ModeIndex: modeIndex,
    }
    callCMS('ChangeMode', param);
  }
}

function apply(modelID, guid, onApply) {
  if (onApply) {
    onCMS('onApplyResult', function(data) {
      var result = JSON.parse(data);   
      if (result.result != 1)
        onApply(false);
      else
        onApply(true);    
    });
    var param = {
      AccoutID: cms.accountID,
      ModelID: modelID,
      GUID: guid,
    }
    callCMS('ApplyConfig', param);
  }
}

function getMacroList(onMacroList) {
  if(onMacroList) {
    var param = {
      AccoutID: cms.accountID,
    };
    callCMS('GetMacroList', param, function(data) {
      var macros = JSON.parse(data);
      if(macros === null)
        onMacroList([]);
      else
        onMacroList(macros);
    });
  }
}

function readMacroFile(guid, onReadMacroFile) {
  if(onReadMacroFile) {
    var param = {
      AccoutID: cms.accountID,
      GUID: guid,
    }
    callCMS('ReadMacrofile', param, function(data) {
      var macro = JSON.parse(data);
        onReadMacroFile(macro);
    });
  }
}

function writeMacroFile(guid, macro, onWriteMacroFile) {
  if(onWriteMacroFile) {
    var param = {
      AccoutID: cms.accountID,
      GUID: guid,
      Data: JSON.stringify(macro),
    }
    callCMS('WriteMacrofile', param, function() {
      onWriteMacroFile();
    });
  }
}

function deleteMacrofile(guid, onDeleteMacrofile) {
  if(onDeleteMacrofile) {
    var param = {
      AccoutID: cms.accountID,
      GUID: guid,
    }
    callCMS('DeleteMacrofile', param,
      function() {
        onDeleteMacrofile(true);
      },
      function() {
        onDeleteMacrofile(false);
      });
  }
}

function getLEList(onLEList) {
  if(onLEList) {
    var param = {
      AccoutID: cms.accountID,
    };
    callCMS('GetLEList', param, function(data) {
      var les = JSON.parse(data);
      if(les === null)
        onLEList([]);
      else
        onLEList(les);
    });
  }
}

function readLE(guid, onReadLE) {
  if(onReadLE) {
    var param = {
      AccoutID: cms.accountID,
      GUID: guid,
    }
    callCMS('ReadLE', param, function(data) {
      var le = JSON.parse(data);
      onReadLE(le);
    });
  }
}

function writeLE(guid, le, onWriteLE) {
  if(onWriteLE) {
    var param = {
      AccoutID: cms.accountID,
      GUID: guid,
      Data: JSON.stringify(le),
    }
    callCMS('WriteLE', param, function() {
      onWriteLE();
    });
  }
}

function deleteLE(guid, onDeleteLE) {
  if(onDeleteLE) {
    var param = {
      AccoutID: cms.accountID,
      GUID: guid,
    }
    callCMS('DeleteLE', param, function() {
      onDeleteLE();
    });
  }
}

function startHotKey(onHotKey) {
  if (onHotKey) {
    onCMS('onHotKeyDown', function(data) {
      var hotkey = JSON.parse(data);
      onHotKey(hotkey);
    });
    callCMS('StartHotKey');
  }
}

function stopHotKey() {
  callCMS('StopHotKey');
}

function startRecord() {
  callCMS('StartRecord');
}

function listenStopMakeMacro(isEnterStopButton) {
  var param = {
    "SetRecordBtn":isEnterStopButton
  }
  callCMS('SetRecordBtn', param, function(data) {
    console.log('listenStopMakeMacro', isEnterStopButton);
  });

}

function stopRecord() {
  callCMS('StopRecord');
}

function onKeyDown(onKeyDownCallBack) {
  onCMS('onKeyDown', function(data){
    onKeyDownCallBack(data);
  });
}

function onKeyUp(onKeyUpCallBack) {
  onCMS('onKeyUp', function(data){
    onKeyUpCallBack(data);
  });
}

function onDelay(onDelayCallBack) {
  onCMS('onDelay', function(data){
    onDelayCallBack(data);
  });
}

function onMouseDown(onMouseDownCallBack) {
  onCMS('onMouseDown', function(data){
    onMouseDownCallBack(data);
  });
}

function onMouseUp(onMouseUpCallBack) {
  onCMS('onMouseUp', function(data){
    onMouseUpCallBack(data);
  });
}

function openFileDialog(onOpenFileDialog) {
  callCMS('OpenFileDialog', {}, function(data) {
    data = data.replace(/\\/g, "/");
    onOpenFileDialog(data);
  });
}


function openFileDialogEx(onOpenFileDialogEx) {
  callCMS('OpenFileDialogEx', {}, function(data) {
    data = data.replace(/\\/g, "/");
    onOpenFileDialogEx(data);
  });
}

function readEnvConfig(onReadEnvConfig) {
  if (onReadEnvConfig) {
    var param = {
      Type: 0,
      Path: 'Env.json'
    }
    callCMS('ReadFile', param, function(data) {
      var config = JSON.parse(data);
      onReadEnvConfig(config);
    });
  }
}

function readModelList(onReadModelList) {
  if (onReadModelList) {
    var param = {
      Type: 0,
      Path: 'device/modellist.json'
    }
    callCMS('ReadFile', param, function(data) {
      var modellist = JSON.parse(data);
      onReadModelList(modellist);
    });
  }
}

function readModelProfile(modelID, name, onReadModelProfile) {
  if (onReadModelProfile) {
    var param = {
      Type: 0,
      Path: 'device/' + modelID + '/data/' + name + '.json'
    }
    callCMS('ReadFile', param,
      function(data) {
        var profile = JSON.parse(data);
        onReadModelProfile(profile);
      },
      function(code, message) {
        onReadModelProfile(null);
      }
    );
  }
}

function readAppConfig(onReadAppConfig) {
  if (onReadAppConfig) {
    var param = {
      Type: 1,
      Path: 'AppConfig.json'
    }
    callCMS('ReadFile', param, 
      function(data) {
        var config = JSON.parse(data);
        onReadAppConfig(config);
      },
      function(code, message) {
        onReadAppConfig(null);
      }
    );
  }
}

function writeAppConfig(config, onWriteAppConfig) {
  var param = {
    Type: 1,
    Path: 'AppConfig.json',
    Data: JSON.stringify(config),
  }
  callCMS('WriteFile', param, function() {
    onWriteAppConfig && onWriteAppConfig();
  });
}

function readUserConfig(onReadUserConfig) {
  if (onReadUserConfig) {
    var param = {
      Type: 1,
      Path: 'Account/' + cms.accountID + '/Config.json',
    }
    callCMS('ReadFile', param, 
      function(data) {
        var config = JSON.parse(data);
        onReadUserConfig(config);
      },
      function(code, message) {
        onReadUserConfig(null);
      }
    );
  }
}

function writeUserConfig(config, onWriteUserConfig) {
  var param = {
    Type: 1,
    Path: 'Account/' + cms.accountID + '/Config.json',
    Data: JSON.stringify(config),
  }
  callCMS('WriteFile', param, function() {
    onWriteUserConfig && onWriteUserConfig();
  });
}

function readMacroList(onReadMacroList) {
  if (onReadMacroList) {
    var param = {
      Type: 1,
      Path: 'Account/' + cms.accountID + '/Macro/' + 'macrolist.json'
    }
    callCMS('ReadFile', param, function(data) {
      var config = JSON.parse(data);
      onReadMacroList(config);
    });
  }
}

function writeMacroList(macrolist, onWriteMacroList) {
  var param = {
    Type: 1,
    Path: 'Account/' + cms.accountID + '/Macro/' + 'macrolist.json',
    Data: JSON.stringify(macrolist),
  }
  callCMS('WriteFile', param, function() {
    onWriteMacroList && onWriteMacroList();
  });
}

function readLEList(onReadLEList) {
  if (onReadLEList) {
    var param = {
      Type: 1,
      Path: 'Account/' + cms.accountID + '/LE/' + 'lelist.json'
    }
    callCMS('ReadFile', param, function(data) {
      var config = JSON.parse(data);
      onReadLEList(config);
    });
  }
}

function writeLEList(lelist, onWriteLEList) {
  var param = {
    Type: 1,
    Path: 'Account/' + cms.accountID + '/LE/' + 'lelist.json',
    Data: JSON.stringify(lelist),
  }
  callCMS('WriteFile', param, function() {
    onWriteLEList && onWriteLEList();
  });
}


function copyMacro(guid, onCopyMacro) {
  var param = {
    SrcPath: 'res/data/macro/' + guid + '.cms',
    DestPath: 'Account/' + cms.accountID + '/Macro/' + guid + '.cms',
  }
  callCMS('CopyFile', param, function() {
    onCopyMacro && onCopyMacro();
  });
}

function copyLE(guid, onCopyLE) {
  var param = {
    SrcPath: 'res/data/le/' + guid + '.le',
    DestPath: 'Account/' + cms.accountID + '/LE/' + guid + '.le',
  }
  callCMS('CopyFile', param, function() {
    onCopyLE && onCopyLE();
  });
}

function copyModelMacro(modelID, guid, onCopyMacro) {
  var param = {
    SrcPath: 'device/' + modelID + '/data/macro/' + guid + '.cms',
    DestPath: 'Account/' + cms.accountID + '/Macro/' + guid + '.cms',
  }
  callCMS('CopyFile', param, function() {
    onCopyMacro && onCopyMacro();
  });
}

function copyModelLE(modelID, guid, onCopyLE) {
  var param = {
    SrcPath: 'device/' + modelID + '/data/le/' + guid + '.le',
    DestPath: 'Account/' + cms.accountID + '/LE/' + guid + '.le',
  }
  callCMS('CopyFile', param, function() {
    onCopyLE && onCopyLE();
  });
}

function minimizeCMSUI() {
  callCMS('MiniSizeWnd');
}

function closeCMSUI() {
  callCMS('CloseWnd');
}

function openURL(url) {
  callCMS('OpenURL', { URL: url });
}

function openDebugWnd() {
  callCMS('OpenDebugWnd');
}

function startDrag() {
  CMSDesktop.startDrag();
}