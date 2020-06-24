var MacroRecordData ={
	"normal":{
		delayModel: 0,
		delayTime: null,
		recordStatus: "new"
	},
	"insert":{
		delayModel: 2,
		delayTime: 1000,
		recordStatus: "before"
	},
	"model": "normal"
}
var Macros = {
	macros: null,
	macroData: [],
	taskList: []
};
$.multilang=window.parent.$.multilang;

$(document).ready(function(){
	$("img").attr("draggable","false");
	initUI();
	macroEvent();
	window.parent.setLanguage(false);
});

function initUI() {
	//渲染所有宏列表
	Macros.macros = window.parent.CMS.macros;
	renderMacroList(Macros.macros);

	//宏功能操作
	$("#macro_function").find(".ximagebutton").ximagebutton({
		colors: {
      normal: "#787878",
      active: "#00c2ff"
    }
	});
	$("#macro_menu_func").find(".imagebutton").eq(2).imagebutton('active');
	$("#macro_menu_func").find(".imagebutton").eq(3).imagebutton('active');
	// $("#macro_menu_func").find(".imagebutton").eq(2).imagebutton('disable');
	// $("#macro_menu_func").find(".imagebutton").eq(3).imagebutton('disable');

	//监听停止录制按钮
	$("#stopRecordMacro").off('mouseenter mouseleave').mouseenter(function(){
		window.parent.listenStopMakeMacro(true);
	}).mouseleave(function(){
		window.parent.listenStopMakeMacro(false);
	});
	$("#macro_item_record_stop").off('mouseenter mouseenter').mouseenter(function(){
		window.parent.listenStopMakeMacro(true);
	}).mouseleave(function(){
		window.parent.listenStopMakeMacro(false);
	});
}

function changeMacroName(guid, macroName, macros, isGo) {
	if (!isGo)
		return isGo;
	for(var i= 0; i< macros.length; i++) {
		if(macros[i].Type === 1) {
			isGo = changeMacroName(guid, macroName, macros[i].Data, isGo);
			if(!isGo)
				break;
		} else {
			if(macros[i].GUID === guid) {
				macros[i].Name = macroName;
				isGo = false;
				break;
			}
		}		
	}
	return isGo;
}

//宏事件处理
function macroEvent() {
	//修改宏名称
	$("#current_macro_name").blur(function(){
		var guid = $(this).data('guid');
		var macroName = $(this).val();
		if (guid == null)
			return;
		if (macroName == Macros.macroData.MacroName || Macros.macroData.MacroName == null)
			return;

		if (macroName == null && Macros.macroData.MacroName != null) {
			window.parent.warning($.multilang("macro_name_empty"));
			$(this).val(Macros.macroData.MacroName);
			return;
		}	

		Macros.macroData.MacroName = macroName;
		var isGo = true;
		isGo = changeMacroName(guid, macroName, Macros.macros, isGo);
		if(!isGo) {
			window.parent.writeMacroList(Macros.macros, function(){
				console.log('修改宏列表成功');
			});
		}

		window.parent.writeMacroFile(Macros.macroData.GUID, Macros.macroData, function(){
			$("#macro_items").find("li.selected").find("p").text(Macros.macroData.MacroName);
			console.log("修改宏名称成功");
		});		
	})

	//选择延迟模式
	$("#macro_delay").find(".delay-model").off('click').click(function(){
		$(this).siblings().find(".circle").removeClass("selected");
		!$(this).find(".circle").hasClass("selected") && $(this).find(".circle").addClass("selected");
		var index = $(this).index();
		switch (index){
			case 0: {
				MacroRecordData.normal.delayTime = null;
			}
			break;
			case 1: {
				MacroRecordData.normal.delayTime = 5;
			}
			break;
			case 2: {
				MacroRecordData.normal.delayTime = parseInt($(this).parent().find("input").val());
			}
			break;
		}
		MacroRecordData.normal.delayModel = index;
	});

	//宏功能操作
	$("#macro_function").find(".ximagebutton").ximagebutton({
    onClick: function(){
    	var $element = this;
    	var index = $element.index();
    	switch (index) {
    		case 0:
    		makeMacro();
    		break;
    		case 1:
    		stopRecordMacro();
    		break;
    		case 2:
    		editMacro();
    		break;
    		case 3:
    		deleteMacro();
    		break;
    		case 4:
				moveUpMacro();
    		break;
    		case 5:
    		moveDownMacro();
    		break;
    		case 6:
    		insertMacro();
    		break;
    	}
		}
	});

	//宏文件操作
	$("#macro_menu_func").find(".imagebutton").imagebutton({
		onClick: function () {
			var $element = this;
			var index = $element.parent().index();
    	switch (index) {
    		case 0:
    		addMacroFile();
    		break;	
    		case 1:
    		deleteMacroFile();
    		break;
    // 		case 2:
    // 		exportMacroFile();
    // 		break;
    // 		case 3:
				// importMacroFile();
    // 		break;
    	}
		}
	});

}

//渲染宏列表
function renderMacroList(data, title) {
	if (title) {
		$("#macro_menu_title").find("span").removeClass("active");
		var macroTitle = $("#macro_menu_title").html() + "<i>&nbsp;&nbsp;/&nbsp;&nbsp;</i><span class='active' data-info='" + JSON.stringify(data) +  "'>" + title + "</span>";
		$("#macro_menu_title").empty();
		$("#macro_menu_title").append(macroTitle);
	} else {
		var macroTitle = "<span class='active' cms-lang='macro_list'>"+$.multilang("macro_list")+"</span>";
		$("#macro_menu_title").empty();
		$("#macro_menu_title").append(macroTitle);
	} 
	$("#macro_items").empty();
	if (Object.prototype.toString.call(data) !== '[object Array]' || data.length === 0) {
		return;
	}
	var str = '';
	for (var i = 0; i < data.length; i++) {
		if(data[i].Type === 1) {
			str += "<li data-type='" + data[i].Type + "' data-info='" + JSON.stringify(data[i].Data) + "'>\
			<img src='res/img/macro/" + data[i].Icon + "' />\
			<p>" + data[i].Name + "</p>\
			</li>";
		} else {
			str += "<li  data-type='" + data[i].Type + "' data-guid='" + data[i].GUID + "'>\
			<img src='res/img/macro/" + data[i].Icon + "' />\
			<p>" + data[i].Name + "</p>\
			</li>";
		}
	}
	$("#macro_items").append(str);

	macroOperate();
}

//宏文件操作
function macroOperate() {
	$("#macro_items").find("li").off('click').click(function(){
		if($(this).data("type") == 1) {
			var data = $(this).data("info");
			var name = $(this).find("p").text();
			renderMacroList(data, name);
		} else {
			var name = $(this).find("p").text();
			var guid = $(this).data("guid");		
			$(this).addClass("selected").siblings().removeClass("selected");
			$(this).siblings().find("p").css({"color": "#474747"});
			$(this).siblings().find("img").css({"boxShadow": "none"});
			$(this).find("p").css({"color": "#ff9c00"});
			$(this).find("img").css({"boxShadow": "0px 0px 0px 2px #ff9c00"});
			window.parent.readMacroFile(guid, function(data){
				Macros.macroData = data;
				if (Macros.macroData.TaskList === null)
					Macros.macroData.TaskList = [];
				$("#current_macro_name").val(name);
				$("#current_macro_name").data("guid", guid);
				renderMacroData(Macros.macroData);
			});
		}
	});

	$("#macro_menu_title").find("span").off('click').click(function(){
		if($(this).hasClass("active")) return;
		var name = $(this).text();
		var data = $(this).data("info");
		if(!data)
			renderMacroList(Macros.macros)
			else
			renderMacroList(data, name);
	});
}

function renderMacroData(data) {
	$("#macro_show").empty();
	var taskList = data.TaskList;
	var str = '';
	for (var i = 0; i < taskList.length; i++) {
		switch(taskList[i].taskName) 
		{	
			case 'KeyDown':{
				str += '<li data-type="KeyDown" data-content="' + taskList[i].taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/key_down.png" />\
				<span>' + taskList[i].taskValue.replace(/\"/g, "") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
			}
			break;
			case 'KeyUp':{
				str += '<li data-type="KeyUp" data-content="' + taskList[i].taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/key_up.png" />\
				<span>' + taskList[i].taskValue.replace(/\"/g, "") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
			}
			break;
			case 'Delay':{
				str += '<li data-type="Delay" data-content="' + taskList[i].taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/time.png" />\
				<span>' + taskList[i].taskValue.replace(/\"/g, "") + ' ms</span>\
				<input type="text" value="" onkeypress="if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;"/>\
				</li>';
			}
			break;
			case 'LeftDown':{
				str += '<li data-type="LeftDown">\
				<img src="res/img/mouse.png" />\
				<span>' + $.multilang("macro_left_down") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
			}
			break;
			case 'LeftUp':{
				str += '<li data-type="LeftUp">\
				<img src="res/img/mouse.png" />\
				<span>' + $.multilang("macro_left_up") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
			}
			break;
			case 'RightDown':{
				str += '<li data-type="RightDown">\
				<img src="res/img/mouse.png" />\
				<span>' + $.multilang("macro_right_down") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
			}
			break;
			case 'RightUp':{
				str += '<li data-type="RightUp">\
				<img src="res/img/mouse.png" />\
				<span>' + $.multilang("macro_right_up") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
			}
			break;
		}
	}
	$("#macro_show").append(str);
	var scrollHeight = 36 * taskList.length;
	$("#macro_show").scrollTop(scrollHeight);
	var len = $("#macro_show li").length;
	len && $("#macro_show li").eq(len - 1).find("span").addClass("active");

	initOtherActiveTaskItem();
	macroDataOperate();
}

function macroDataOperate() {
	$("#macro_show li").off('mouseenter mouseleave').hover(function(){
		$(this).find("span").addClass("hover");
	},function(){
		$(this).find("span").removeClass("hover");
	});

	$("#macro_show li").off('click').click(function(){
		$("#macro_show li span").removeClass("active");
		$("#macro_show li span").removeClass("active-other");
		$(this).find("span").addClass("active");

		initOtherActiveTaskItem();
	});
}

function initOtherActiveTaskItem() {
	var index = $("#macro_show li").find(".active").parent().index();
	$element = $("#macro_show li").eq(index);
	var type = $element.data("type");
	var content = $element.data("content");
	
	switch (type) {
		case 'KeyDown':{
			var otherIndex = -1;
			$element.nextAll("li[data-type='KeyUp']").each(function(i, item){
				if($(item).data("content") == content) {
					otherIndex = $(item).index();
					return false;
				}
			});
		}
		break;
		case 'KeyUp':{
			var otherIndex = -1;
			$element.prevAll("li[data-type='KeyDown']").each(function(i, item){
				if($(item).data("content") == content) {
					otherIndex = $(item).index();
					return false;
				}
			});
		}
		break;
		case 'Delay':{
			var otherIndex = -1;
		}
		break;
		case 'LeftDown':{
			var otherIndex = $element.nextAll("li[data-type='LeftUp']").index();
		}
		break;
		case 'LeftUp':{
			var otherIndex = $element.prevAll("li[data-type='LeftDown']").index();
		}
		break;
		case 'RightDown':{
			var otherIndex = $element.nextAll("li[data-type='RightUp']").index();
		}
		break;
		case 'RightUp':{
			var otherIndex = $element.prevAll("li[data-type='RightDown']").index();
		}
		break;
	}
	(otherIndex >= 0) && $("#macro_show li").eq(otherIndex).find("span").addClass("active-other");
}

//录制宏指令
function makeMacro() {
	if(Macros.macroData === null || (!Macros.macroData.GUID)) {
		window.parent.warning($.multilang("macro_selecte_macro"));
		return;
	}
	MacroRecordData.normal.recordStatus = "new";
	$("#macro_show").empty();
	$("#macro_function").find(".ximagebutton").eq(0).hide();
	$("#macro_function").find(".ximagebutton").eq(1).show();
	Macros.macroData.TaskList = [];
	onKeyResponse();
	window.parent.startRecord();

}

//停止录制宏
function stopRecordMacro() {
	window.parent.stopRecord();
	
	$("#stopRecordMacro").hide();
	$("#startRecordMacro").show();
	initOtherActiveTaskItem();
	macroDataOperate();

	window.parent.writeMacroFile(Macros.macroData.GUID, Macros.macroData, function(){
		console.log("录制宏成功");
	});
}

//编辑宏指令
function editMacro() {
	if(macroData === null || (!Macros.macroData.GUID) ) {
		window.parent.warning($.multilang("macro_selecte_item"));
		return;
	}
	
	if(Object.prototype.toString.call(Macros.macroData.TaskList) === '[object Array]' && Macros.macroData.TaskList.length === 0) {
		window.parent.warning($.multilang("macro_selecte_item"));
		return;
	}
	MacroRecordData.normal.recordStatus = "edit";
	MacroRecordData.model = 'normal';
	var macroData = Macros.macroData;		
	var index = $("#macro_show li").find(".active").parent().index();
	if (index < 0 || index >= macroData.TaskList.length) 
		return;

	var $element = $("#macro_show li").eq(index);
	var content = $element.find("span").text();
	var type = $element.data("type");
	switch (type) {
		case 'KeyDown':{
			$element.find("span").hide();
			$element.find("input").show();
			$element.find("input").addClass("selected");
			$element.find("input").focus().val($("#macro_show li").eq(index).find("span").text());
			$("#macro_div").show();
			onKeyResponse();
			window.parent.startRecord();		
			stopEditMacro();
			return false;	
		}
		break;
		case 'KeyUp':{
			$element.find("span").hide();
			$element.find("input").show();
			$element.find("input").addClass("selected");
			$element.find("input").focus().val($("#macro_show li").eq(index).find("span").text());
			$("#macro_div").show();
			onKeyResponse();
			window.parent.startRecord();		
			stopEditMacro();
			return false;	
		}
		break;
		case 'Delay':{
			$element.find("span").hide();
			$element.find("input").show();
			$element.find("input").addClass("selected");
			var dalayValue = $("#macro_show li").eq(index).find("span").text();
			$element.find("input").focus().val(dalayValue.replace(/[^0-9]/g, ""));
			$element.find("input").keyup(function(){
				var val = parseInt($(this).val());
				if (val > 6000)
					$(this).val(6000);
			});
			$("#macro_div").show();		
			stopEditMacro();
			return false;
		}
		break;
		case 'LeftDown':{
			return;
		}
		break;
		case 'LeftUp':{
			return;
		}
		break;
		case 'RightDown':{
			return;
		}
		break;
		case 'RightUp':{
			return;
		}
		break;
	}	
}

function stopEditMacro() {
	$("#macro_show li").off("blur", "input.selected").on("blur", "input.selected", function(){
		var macroData = Macros.macroData;
		var type = $(this).parent().data("type");
		var index=$(this).parent().index();

		var indexOther=$(".active-other").parent().index();
		window.parent.stopRecord();
		var content = $(this).val();
		var type = $(this).parent().data("type");
		switch (type) {
			case 'KeyDown':{
				$(this).parent("li").data("content", content);
				$(this).parent("li").find("span").text(content);
				$("#macro_show").find(".active-other").text(content);
				$("#macro_show").find(".active-other").parent("li").data("content", content);
			}
			break;
			case 'KeyUp':{
				$(this).parent("li").data("content", content);
				$(this).parent("li").find("span").text(content);
				$("#macro_show").find(".active-other").text(content);
				$("#macro_show").find(".active-other").parent("li").data("content", content);
			}
			break;
			case 'Delay':{
				if (parseInt(content) > 60000) 				
					content = 6000;			
				if (content == "" || parseInt(content) <= 5) 
					content = 5;
				$(this).val(content);
				$(this).parent("li").data("content", content);
				$(this).parent("li").find("span").text(content + ' ms');
			}
			break;
			default: 
			break;
		}
		$(this).hide();
		$(this).prev("span").show();
		$("#macro_div").hide();

		Macros.macroData.TaskList[index].taskValue = content;
		if (indexOther >= 0)
			Macros.macroData.TaskList[indexOther].taskValue = content;

	  window.parent.writeMacroFile(Macros.macroData.GUID, Macros.macroData, function(){
	  	console.log('修改宏成功');
	  });		
	});
}


//删除宏指令
function deleteMacro() {
	if(macroData === null || (!Macros.macroData.GUID) ) {
		window.parent.warning($.multilang("macro_selecte_macro"));
		return;
	}
	
	if(Object.prototype.toString.call(Macros.macroData.TaskList) === '[object Array]' && Macros.macroData.TaskList.length === 0) {
		window.parent.warning($.multilang("macro_selecte_item"));
		return;
	}
	var macroData = Macros.macroData;	
	var index = $("#macro_show li").find(".active").parent().index();
	if (index < 0 || index >= macroData.TaskList.length) 
		return;

	if ($("#macro_show li span").hasClass("active-other")) {
		var indexOther = $("#macro_show li").find(".active-other").parent().index();
		if (indexOther >= macroData.TaskList.length) 
			return;
		if (index < indexOther) {
			macroData.TaskList.splice(indexOther, 1);
			macroData.TaskList.splice(index, 1);
			$("#macro_show li").eq(indexOther).remove();
			$("#macro_show li").eq(index).remove();		
			var indexNew = index;
		} else {
			macroData.TaskList.splice(index, 1);
			macroData.TaskList.splice(indexOther, 1);	
			$("#macro_show li").eq(index).remove();
			$("#macro_show li").eq(indexOther).remove();
			var indexNew = index - 1;
		}		
	} else {
		macroData.TaskList.splice(index, 1);
		$("#macro_show li").eq(index).remove();
		var indexNew = index;	
	}
	if(indexNew >= $("#macro_show li").length)
		indexNew = $("#macro_show li").length - 1;
	$("#macro_show li").eq(indexNew).find("span").addClass("active");
	initOtherActiveTaskItem();

	window.parent.writeMacroFile(macroData.GUID, macroData, function(){
		console.log("宏删除成功");
	});	
}

//上移宏指令
function moveUpMacro() {
	if(macroData === null || (!Macros.macroData.GUID) ) {
		window.parent.warning($.multilang("macro_selecte_macro"));
		return;
	}
	
	if(Object.prototype.toString.call(Macros.macroData.TaskList) === '[object Array]' && Macros.macroData.TaskList.length === 0) {
		window.parent.warning($.multilang("macro_selecte_item"));
		return;
	}
	var macroData = Macros.macroData;
	var index = $("#macro_show li").find(".active").parent().index();
	if (index <= 0 || index >= macroData.TaskList.length) 
		return;
	if ($("#macro_show li span").hasClass("active-other")) {
		var indexOther = $("#macro_show li").find(".active-other").parent().index();
		if((index - 1) === indexOther) 		
			return;	
	}

	var item = macroData.TaskList[index];
	macroData.TaskList.splice(index, 1);
	macroData.TaskList.splice(index - 1, 0, item);
	var cloneitem = $("#macro_show li").find(".active").parent().clone(true);
	$("#macro_show li").eq(index - 1).before(cloneitem);
	$("#macro_show li").eq(index + 1).remove();
	window.parent.writeMacroFile(macroData.GUID, macroData, function(){
		console.log("宏上移成功");
	});
}

//下移宏指令
function moveDownMacro() {
	if(macroData === null || (!Macros.macroData.GUID) ) {
		window.parent.warning($.multilang("macro_selecte_macro"));
		return;
	}
	
	if(Object.prototype.toString.call(Macros.macroData.TaskList) === '[object Array]' && Macros.macroData.TaskList.length === 0) {
		window.parent.warning($.multilang("macro_selecte_item"));
		return;
	}
	var macroData = Macros.macroData;
	var index = $("#macro_show li").find(".active").parent().index();
	if (index < 0 || index >= macroData.TaskList.length - 1) 
		return;
	if($("#macro_show li span").hasClass("active-other")){
		var indexOther = $("#macro_show li").find(".active-other").parent().index();
		if((index + 1) === indexOther) 
			return;	
	}

	var item = macroData.TaskList[index];
	macroData.TaskList.splice(index, 1);
	macroData.TaskList.splice(index + 1, 0, item);
	var cloneitem = $("#macro_show li").find(".active").parent().clone(true);
	$("#macro_show li").eq(index + 1).after(cloneitem);
	$("#macro_show li").eq(index).remove();
	window.parent.writeMacroFile(macroData.GUID, macroData, function(){
		console.log("宏下移成功");
	});
}

//插入宏指令
function insertMacro() {
	if(macroData === null || (!Macros.macroData.GUID) ) {
		window.parent.warning($.multilang("macro_selecte_macro"));
		return;
	}
	
	if(Object.prototype.toString.call(Macros.macroData.TaskList) === '[object Array]' && Macros.macroData.TaskList.length === 0) {
		window.parent.warning($.multilang("macro_selecte_item"));
		return;
	}
	var macroData = Macros.macroData;
	Macros.taskList = [];
	MacroRecordData.model = 'insert';

	// 插入操作区显示
	initInsertWindow();

	//选择插入录制模式
	$("#macro_insert_select").off('click').click(function(){
		if($("#macro_select_menu").is(":visible")){
			$("#macro_select_menu").hide();
		}else{
			$("#macro_select_menu").show();
		}
		return false;
	});

	$("#macro_select_menu").find(".macro-select-item").off('click').click(function(){
		var index = $(this).index();
		$("#macro_insert_content").text($(this).text());
		$("#macro_insert_content").data("index",index);
		$("#macro_select_menu").fadeOut("fast");
		switch(index){
			case 0:		
			$("#macro_select_mode_2").hide();
			$("#macro_change_record").hide();		
			$("#macro_choose").text($.multilang("macro_insert"));
			$("#macro_select_mode_1").show();
			break;
			case 1:	
			$("#macro_select_mode_2").hide();
			$("#macro_change_record").hide();		
			$("#macro_choose").text($.multilang("macro_insert"));
			$("#macro_select_mode_1").show();
			break;
			case 2:
			MacroRecordData.insert.recordStatus = 'before';
			$("#macro_select_mode_1").hide();
			$("#macro_change_record").show();
			$("#macro_choose").text($.multilang("macro_save"));
			$("#macro_select_mode_2").show();
			break;
			case 3:
			MacroRecordData.insert.recordStatus = 'after';
			$("#macro_select_mode_1").hide();				
			$("#macro_change_record").show();
			$("#macro_choose").text($.multilang("macro_save"));
			$("#macro_select_mode_2").show();
			break;
		}
	});

	//输出延迟格式检查
  $("#macro_duration_text-1").off('blur').blur(function(){
    if ($(this).val() > 60000) 
      $("#macro_duration_text-1").val(60000); 
    if ($(this).val() == "" || $(this).val() < 5)
      $("#macro_duration_text-1").val(5);
  });
  $("#macro_duration_text-2").off('blur').blur(function(){
    if ($(this).val() > 60000) 
      $("#macro_duration_text-2").val(60000);
    if ($(this).val() == "" || $(this).val() < 5)
      $("#macro_duration_text-2").val(5);
    if(MacroRecordData.insert.delayModel === 2)
    	MacroRecordData.insert.delayTime = parseInt($("#macro_duration_text-2").val());
  });

	$("#macro_select_mode_2").find(".delay-model").off('click').click(function(){
		var delayModel = parseInt($(this).val());
		MacroRecordData.insert.delayModel = delayModel;
		switch (delayModel){
			case 0:{
				MacroRecordData.insert.delayTime = null;
				$("#macro_duration_text-2").attr("readonly","readonly");
			}
			break;
			case 1:{
				MacroRecordData.insert.delayTime = 5;			
				$("#macro_duration_text-2").attr("readonly","readonly");
			}
			break;
			case 2:{
				MacroRecordData.insert.delayTime = parseInt($("#macro_duration_text-2").val());
				$("#macro_duration_text-2").removeAttr("readonly");
			}
			break;
		}
		MacroRecordData.insert.delayModel = delayModel;
	})  

	//插入录制时开始录制
	$("#macro_item_record_start").off('click').click(function(){
		$(this).hide();
		$("#macro_item_record_stop").show();
		//$(".macro-change-cover").show();
		Macros.taskList = [];
		if(MacroRecordData[MacroRecordData.model].recordStatus === 'after') {
			var index = $("#macro_show li").find(".active").parent().index();
			$("#macro_show li").eq(index).find("span").addClass("active-after");
		};
		onKeyResponse();
		window.parent.startRecord();

	});

	//插入录制时停止录制
	$("#macro_item_record_stop").off('click').click(function(){
		
		var delayTime = MacroRecordData[MacroRecordData.model].delayTime;
		var delayModel = MacroRecordData[MacroRecordData.model].delayModel;
		
		var index = $("#macro_show li").find(".active").parent().index();	

		initOtherActiveTaskItem();
		$(this).hide();
		$("#macro_item_record_start").show();
		//$(".macro-change-cover").hide();
		window.parent.stopRecord();
	});

	//插入|保存按钮保存到配置文件
	$("#macro_choose").off('click').click(function(){
		var index = parseInt($("#macro_insert_content").data("index"));
		switch(index){
			case 0:
			recordDelay_0();
			break;
			case 1:
			recordDelay_1();
			break;
			case 2:
			recordDelay_2();
			break;
			case 3:
			recordDelay_3();
			break;
		}
		macroDataOperate();
		MacroRecordData.model = 'normal';
		$("#macro_div").hide();
		$("#macro_change").hide();
	});

	//取消插入到配置文件
	$("#macro_cancel").off('click').click(function(){
		var index = $("#macro_show li").find(".active").parent().index();
		$("#macro_show li").find("span").removeClass(".active-after");
		for(var i = 0; i < Macros.taskList.length; i++) {		
			if (MacroRecordData[MacroRecordData.model].recordStatus === 'after') {
				$("#macro_show li").eq(index + 1).remove();
			} else if (MacroRecordData[MacroRecordData.model].recordStatus === 'before') {
				$("#macro_show li").eq(index - Macros.taskList.length).remove();
			}
		}
			
		MacroRecordData.model = 'normal';
		$("#macro_div").hide();
		$("#macro_change").hide();
	});
}

function initInsertWindow() {
	$("#macro_div").is(":hidden") && $("#macro_div").show();
	$("#macro_change").is(":hidden") && $("#macro_change").show();

}


function recordDelay_0(){
	var delayTime = $("#macro_duration_text-1").val();
	var index = $("#macro_show li").find(".active").parent().index();
	str = '<li data-type="Delay" data-content="' + delayTime + '">\
	<img src="res/img/time.png" />\
	<span>' + delayTime + ' ms</span>\
	<input type="text" value="" onkeypress="if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;"/>\
	</li>';
	$("#macro_show li").eq(index).before(str);
	var scrollHeight = $("#macro_show").scrollTop() + 36;
	$("#macro_show").scrollTop(scrollHeight);
	if(index >= Macros.macroData.TaskList.length || index < 0)
		return;
	var item = {
		taskName: "Delay",
		taskValue: delayTime
	};
	Macros.macroData.TaskList.splice(index, 0, item);
	window.parent.writeMacroFile(Macros.macroData.GUID, Macros.macroData, function(){
		console.log("之前插入延迟成功");
	});
}
function recordDelay_1(){
	var delayTime = $("#macro_duration_text-1").val();
	var index = $("#macro_show li").find(".active").parent().index();
	str = '<li data-type="Delay" data-content="' + delayTime + '">\
	<img src="res/img/time.png" />\
	<span>' + delayTime + ' ms</span>\
	<input type="text" value="" onkeypress="if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;"/>\
	</li>';
	$("#macro_show li").eq(index).after(str);
	var scrollHeight = $("#macro_show").scrollTop() + 36;
	$("#macro_show").scrollTop(scrollHeight);
	if(index >= Macros.macroData.TaskList.length || index < 0)
		return;
	var item = {
		"taskName": "Delay",
		"taskValue": delayTime
	};
	Macros.macroData.TaskList.splice(index + 1, 0, item);
	window.parent.writeMacroFile(Macros.macroData.GUID, Macros.macroData, function(){
		console.log("之后插入延迟成功");
	});
}
function recordDelay_2(){
	var index = $("#macro_show li").find(".active").parent().index() - Macros.taskList.length;
	for(var i = 0; i < Macros.taskList.length; i++){
		if(index > -1) {
			var item = Macros.taskList[i];
			Macros.macroData.TaskList.splice(index, 0, item);
			index++;
		}
	}
	window.parent.writeMacroFile(Macros.macroData.GUID, Macros.macroData, function(){
		console.log("之前插入录制成功");
	});
}

function recordDelay_3(){
	var index = $("#macro_show li").find(".active").parent().index();
	var scrollHeight = 36 * (index + 1);
	$("#macro_show").scrollTop(scrollHeight);
	$("#macro_show li").find("span").removeClass("active-after");
	for(var i in Macros.taskList){
		if(index < Macros.macroData.TaskList.length && index > -1) {
			var item = Macros.taskList[i];
			Macros.macroData.TaskList.splice(index + 1, 0, item);
			index++;
		}
	}
	window.parent.writeMacroFile(Macros.macroData.GUID, Macros.macroData, function(){
		console.log("之后插入录制成功");
	});
}

//增加宏文件
function addMacroFile() {
	var guid = getGuid();
	var items = getAllMacroItems([], Macros.macros);
  var name = "Macro";
  var size = items.length;
  name = getName(name, size + 1, items);

	window.parent.prompt($.multilang("macro_creat_macro"), $.multilang("macro_input_name"), name, function(result, value){
    if(!result) return;

    for (var i = 0; i < items.length; i++) {
      if (items[i] == value)
        break;
    }
    if (i != items.length) {
      window.parent.warning($.multilang("macro_name_exist"));
      return;
    }

    Macros.macroData = {
			"GUID": guid,
			"MacroName": value,
			"TaskList": []
		}

		macroItem = {
			"GUID": Macros.macroData.GUID,
			"Icon": "default.png",
			"Name": Macros.macroData.MacroName,
			"Type": 0
		}
		Macros.macros.push(macroItem);			
		window.parent.writeMacroList(Macros.macros, function(){	
			console.log('写宏列表成功');
			renderMacroList(Macros.macros);
			$("#macro_items").find("li[data-guid='" + Macros.macroData.GUID + "']").addClass("selected");
			$("#macro_items").find("li[data-guid='" + Macros.macroData.GUID + "']").find("p").css({"color": "#ff0000"});
			$("#macro_items").find("li[data-guid='" + Macros.macroData.GUID + "']").find("img").css({"boxShadow": "0px 0px 0px 2px #ff0000"});
			$("#current_macro_name").val(Macros.macroData.MacroName);
			$("#current_macro_name").data("guid", Macros.macroData.GUID);
			renderMacroData(Macros.macroData);
		});
		window.parent.writeMacroFile(Macros.macroData.GUID, Macros.macroData, function(){
			console.log('写宏数据成功');		
		});
  });
}

function getAllMacroItems(items, macros) {
	if (macros === null)
	 return items;
  for (var i = 0; i < macros.length; i++) {
    if (macros[i].Type === 0) 
      items.push(macros[i].Name);
    else
    	items = getAllMacroItems(items, macros[i].Data);
  }
  return items;
}

function getName(name, size, items) {
  if(typeof(name) !== "string") return;
  var flag = true;
  for (var i = 0; i < items.length; i++) {
    if (items[i] == (name + size)) {
      flag = false;
      break;
    }
  }
  if (flag) {  
    return name + size;  
  } else {  
    size = size + 1;
    return getName(name, size, items);
  }
}

//删除宏文件
function deleteMacroFile() {
	var guid = $("#macro_items").find("li.selected").data("guid");
	if (guid == Macros.macroData.GUID) {
		$("#current_macro_name").val("");
		$("#current_macro_name").data("guid", null);
		Macros.macroData === [];
	}
	window.parent.deleteMacrofile(guid, function(result){
		if(result) {
			window.parent.warning($.multilang("macro_delete_success"));
			$("#macro_items").find("li.selected").remove();
			delMacroElement(Macros.macros, guid);
			window.parent.writeMacroList(Macros.macros, function(){	
			});
		} else
			window.parent.warning($.multilang("macro_delete_error"));
	});
}

//导出宏文件
function exportMacroFile() {
	console.log("导出宏文件");
}

//导入宏文件
function importMacroFile() {
	console.log("导出宏文件");
}

function delMacroElement(data, guid) {
	if (Object.prototype.toString.call(data) !== "[object Array]") return;
	for (var i = 0; i < data.length; i++) {
		if(!data[i].Type) {
			if(data[i].GUID == guid) {
				data.splice(i,1);
				break;
			}
		} else {
			delMacroElement(data.Data, guid);
		}
	}
}

function onKeyResponse() {
	var leftDown = $.multilang("macro_left_down");
	var leftUp = $.multilang("macro_left_up");
	var rightDown = $.multilang("macro_right_down");
	var rightUp = $.multilang("macro_right_up");
	window.parent.onKeyDown(function(data){
		var taskItem = {
			"taskName": "KeyDown",
			"taskValue": data[0]
		}
		switch (MacroRecordData[MacroRecordData.model]['recordStatus']) {
			case 'new':{
				var str = '<li data-type="KeyDown" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/key_down.png" />\
				<span>' + taskItem.taskValue.replace(/\"/g, "") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
				$("#macro_show").append(str);
				$("#macro_show li").find("span").removeClass("active");
				$("#macro_show li").eq($("#macro_show li").length - 1).find("span").addClass("active");
				Macros.macroData.TaskList.push(taskItem);
				var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    	$("#macro_show").scrollTop( scrollHeight );
			}
			break;
			case 'edit':{
				$("#macro_show li").find("input.selected").val(taskItem.taskValue.replace(/\"/g, ""));
				return false;
			}
			break;
			case 'before':{
				var str = '<li data-type="KeyDown" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/key_down.png" />\
				<span>' + taskItem.taskValue.replace(/\"/g, "") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
				var index = $("#macro_show li").find(".active").parent().index();
				$("#macro_show li").eq(index).before(str);
				var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    	$("#macro_show").scrollTop( scrollHeight );			
				Macros.taskList.push(taskItem);
			}
			break;
			case 'after':{
				var str = '<li data-type="KeyDown" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/key_down.png" />\
				<span class="active-after">' + taskItem.taskValue.replace(/\"/g, "") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
				var currentAfterIndex = $("#macro_show li").find(".active-after").parent().index();	
				$("#macro_show li").eq(currentAfterIndex).after(str);	
				$("#macro_show li").eq(currentAfterIndex).find("span").removeClass("active-after");		
				var scrollHeight = $("#macro_show").scrollTop() + 36;			
    		$("#macro_show").scrollTop( scrollHeight );		
				Macros.taskList.push(taskItem);
			}
			break;
		}
	});
	window.parent.onKeyUp(function(data){
		var taskItem = {
			"taskName": "KeyUp",
			"taskValue": data[0]
		}		
		switch (MacroRecordData[MacroRecordData.model]['recordStatus']) {
			case 'new':{
				var str = '<li data-type="KeyUp" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/key_up.png" />\
				<span>' + taskItem.taskValue.replace(/\"/g, "") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
				$("#macro_show").append(str);
				$("#macro_show li").find("span").removeClass("active");
				$("#macro_show li").eq($("#macro_show li").length - 1).find("span").addClass("active");
				Macros.macroData.TaskList.push(taskItem);
				var scrollHeight = $("#macro_show").scrollTop() + 36;
				$("#macro_show").scrollTop( scrollHeight );
			}
			break;
			case 'edit':{
				return;
			}
			break;
			case 'before':{
				var str = '<li data-type="KeyUp" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/key_up.png" />\
				<span>' + taskItem.taskValue.replace(/\"/g, "") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
				var index = $("#macro_show li").find(".active").parent().index();
				$("#macro_show li").eq(index).before(str);
				var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    	$("#macro_show").scrollTop( scrollHeight );
				Macros.taskList.push(taskItem);
			}
			break;
			case 'after':{
				var str = '<li data-type="KeyUp" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/key_up.png" />\
				<span class="active-after">' + taskItem.taskValue.replace(/\"/g, "") + '</span>\
				<input type="text" value="" readonly="readonly"/>\
				</li>';
				var currentAfterIndex = $("#macro_show li").find(".active-after").parent().index();
				$("#macro_show li").eq(currentAfterIndex).after(str);
				$("#macro_show li").eq(currentAfterIndex).find("span").removeClass("active-after");			
				var scrollHeight = $("#macro_show").scrollTop() + 36;			
    		$("#macro_show").scrollTop( scrollHeight );			
				Macros.taskList.push(taskItem);
			}
			break;
		}
	});
	window.parent.onDelay(function(data){
		data[0] = (parseInt(data[0]) < 5) ? '5' : data[0];
		var taskItem = {
			"taskName": "Delay",
			"taskValue": MacroRecordData[MacroRecordData.model].delayTime ? MacroRecordData[MacroRecordData.model].delayTime.toString() : data[0]
		}
		switch (MacroRecordData[MacroRecordData.model]['recordStatus']) {
			case 'new':{
				var str = '<li data-type="Delay" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/time.png" />\
				<span>' + taskItem.taskValue.replace(/\"/g, "") + ' ms</span>\
				<input type="text" value="" onkeypress="if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;"/>\
				</li>';
				$("#macro_show").append(str);
				$("#macro_show li").find("span").removeClass("active");
				$("#macro_show li").eq($("#macro_show li").length - 1).find("span").addClass("active");
				Macros.macroData.TaskList.push(taskItem);
				var scrollHeight = $("#macro_show").scrollTop() + 36;
				$("#macro_show").scrollTop( scrollHeight );
			}
			break;
			case 'edit':{
				return;
			}
			break;
			case 'before':{
				var str = '<li data-type="Delay" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/time.png" />\
				<span>' + taskItem.taskValue.replace(/\"/g, "") + ' ms</span>\
				<input type="text" value="" onkeypress="if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;"/>\
				</li>';
				var index = $("#macro_show li").find(".active").parent().index();
				$("#macro_show li").eq(index).before(str);
				var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    	$("#macro_show").scrollTop( scrollHeight );
				Macros.taskList.push(taskItem);
			}
			break;
			case 'after':{
				var str = '<li data-type="Delay" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
				<img src="res/img/time.png" />\
				<span class="active-after">' + taskItem.taskValue.replace(/\"/g, "") + ' ms</span>\
				<input type="text" value="" onkeypress="if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;"/>\
				</li>';
				var currentAfterIndex = $("#macro_show li").find(".active-after").parent().index();
				$("#macro_show li").eq(currentAfterIndex).after(str);
				$("#macro_show li").eq(currentAfterIndex).find("span").removeClass("active-after");			
				var scrollHeight = $("#macro_show").scrollTop() + 36;			
    		$("#macro_show").scrollTop( scrollHeight );	
				Macros.taskList.push(taskItem);
			}
			break;
		}
	});
	window.parent.onMouseDown(function(data){
		if ( data[0] == 0 ) {
			var taskItem = {
				"taskName": "LeftDown",
				"taskValue": ""
			}
			switch (MacroRecordData[MacroRecordData.model]['recordStatus']) {
				case 'new':{
					var str = '<li data-type="LeftDown" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span>' + leftDown + '</span>\
					<input type="text" value="" readonly="readonly"/>\
					</li>';
					$("#macro_show").append(str);
					$("#macro_show li").find("span").removeClass("active");
					$("#macro_show li").eq($("#macro_show li").length - 1).find("span").addClass("active");
					Macros.macroData.TaskList.push(taskItem);
					var scrollHeight = $("#macro_show").scrollTop() + 36;
					$("#macro_show").scrollTop( scrollHeight );					
				}
				break;
				case 'edit':{
					return;
				}
				break;
				case 'before':{
					var str = '<li data-type="LeftDown" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span>' + leftDown + '</span>\
					<input type="text" value="" readonly="readonly"/>\
					</li>';
					var index = $("#macro_show li").find(".active").parent().index();
					$("#macro_show li").eq(index).before(str);
					var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    		$("#macro_show").scrollTop( scrollHeight );
					Macros.taskList.push(taskItem);
				}
				break;
				case 'after':{
					var str = '<li data-type="LeftDown" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span class="active-after">' + leftDown + '</span>\
					<input type="text" value="" readonly="readonly"/>\
					</li>';
					var currentAfterIndex = $("#macro_show li").find(".active-after").parent().index();
					$("#macro_show li").eq(currentAfterIndex).after(str);
					$("#macro_show li").eq(currentAfterIndex).find("span").removeClass("active-after");		
					var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    		$("#macro_show").scrollTop( scrollHeight );			
					Macros.taskList.push(taskItem);
				}
				break;
			}
		} else {
			var taskItem = {
				"taskName": "RightDown",
				"taskValue": ""
			}	
			switch (MacroRecordData[MacroRecordData.model]['recordStatus']) {
				case 'new':{
					var str = '<li data-type="RightDown" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span>' + rightDown + '</span>\
					<input type="text" value="" readonly="readonly"/>\
					</li>';
					$("#macro_show").append(str);
					$("#macro_show li").find("span").removeClass("active");
					$("#macro_show li").eq($("#macro_show li").length - 1).find("span").addClass("active");
					Macros.macroData.TaskList.push(taskItem);
					var scrollHeight = $("#macro_show").scrollTop() + 36;
					$("#macro_show").scrollTop( scrollHeight );				
				}
				break;
				case 'edit':{
					return;
				}
				break;
				case 'before':{
					var str = '<li data-type="RightDown" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span>' + rightDown + '</span>\
					<input type="text" value="" readonly="readonly"/>\
					</li>';
					var index = $("#macro_show li").find(".active").parent().index();
					$("#macro_show li").eq(index).before(str);
					var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    		$("#macro_show").scrollTop( scrollHeight );
					Macros.taskList.push(taskItem);
				}
				break;
				case 'after':{
					var str = '<li data-type="RightDown" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span class="active-after">' + rightDown + '</span>\
					<input type="text" value="" readonly="readonly"/>\
					</li>';
					var currentAfterIndex = $("#macro_show li").find(".active-after").parent().index();
					$("#macro_show li").eq(currentAfterIndex).after(str);
					$("#macro_show li").eq(currentAfterIndex).find("span").removeClass("active-after");				
					var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    		$("#macro_show").scrollTop( scrollHeight );	
					Macros.taskList.push(taskItem);
				}
				break;
			}
		}
	});
	window.parent.onMouseUp(function(data){
		if (data[0] == 0) {
			var taskItem = {
				"taskName": "LeftUp",
				"taskValue": ""
			}	
			switch (MacroRecordData[MacroRecordData.model]['recordStatus']) {
				case 'new':{
					var str = '<li data-type="LeftUp" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span>' + leftUp + '</span>\
					<input type="text" value=""/>\
					</li>';
					$("#macro_show").append(str);
					$("#macro_show li").find("span").removeClass("active");
					$("#macro_show li").eq($("#macro_show li").length - 1).find("span").addClass("active");					
					Macros.macroData.TaskList.push(taskItem);
					var scrollHeight = $("#macro_show").scrollTop() + 36;
					$("#macro_show").scrollTop( scrollHeight );					
				}
				break;
				case 'edit':{
					return;
				}
				break;
				case 'before':{
					var str = '<li data-type="LeftUp" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span>' + leftUp + '</span>\
					<input type="text" value=""/>\
					</li>';
					var index = $("#macro_show li").find(".active").parent().index();
					$("#macro_show li").eq(index).before(str);
					var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    		$("#macro_show").scrollTop( scrollHeight );
					Macros.taskList.push(taskItem);
				}
				break;
				case 'after':{
					var str = '<li data-type="LeftUp" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span class="active-after">' + leftUp + '</span>\
					<input type="text" value=""/>\
					</li>';
					var currentAfterIndex = $("#macro_show li").find(".active-after").parent().index();
					$("#macro_show li").eq(currentAfterIndex).after(str);
					$("#macro_show li").eq(currentAfterIndex).find("span").removeClass("active-after");			
					var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    		$("#macro_show").scrollTop( scrollHeight );	
					Macros.taskList.push(taskItem);
				}
				break;
			}
		} else {
			var taskItem = {
				"taskName": "RightUp",
				"taskValue": ""
			}	
			switch (MacroRecordData[MacroRecordData.model]['recordStatus']) {
				case 'new':{
					var str = '<li data-type="RightUp" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span>' + rightUp + '</span>\
					<input type="text" value=""/>\
					</li>';
					$("#macro_show").append(str);
					$("#macro_show li").find("span").removeClass("active");
					$("#macro_show li").eq($("#macro_show li").length - 1).find("span").addClass("active");
					Macros.macroData.TaskList.push(taskItem);
					var scrollHeight = $("#macro_show").scrollTop() + 36;
					$("#macro_show").scrollTop( scrollHeight );			
				}
				break;
				case 'edit':{
					return;
				}
				break;
				case 'before':{
					var str = '<li data-type="RightUp" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span>' + rightUp + '</span>\
					<input type="text" value=""/>\
					</li>';
					var index = $("#macro_show li").find(".active").parent().index();
					$("#macro_show li").eq(index).before(str);
					var scrollHeight = $("#macro_show").scrollTop() + 36;
					$("#macro_show").scrollTop( scrollHeight );
					Macros.taskList.push(taskItem);
				}
				break;
				case 'after':{
					var str = '<li data-type="RightUp" data-content="' + taskItem.taskValue.replace(/\"/g, "") + '">\
					<img src="res/img/mouse.png" />\
					<span class="active-after">' + rightUp + '</span>\
					<input type="text" value="" readonly="readonly"/>\
					</li>';
					var currentAfterIndex = $("#macro_show li").find(".active-after").parent().index();
					$("#macro_show li").eq(currentAfterIndex).after(str);
					$("#macro_show li").eq(currentAfterIndex).find("span").removeClass("active-after");			
					var scrollHeight = $("#macro_show").scrollTop() + 36;			
	    		$("#macro_show").scrollTop( scrollHeight );				
					Macros.taskList.push(taskItem);
				}
				break;
			}
		}
	});
}