//取消浏览器默认事件
$(document).keydown(function(e){
  if(e.keyCode == 18)
	e.preventDefault();
  if(e.keyCode == 8)
  {
    if(e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA')
      e.preventDefault();
    if(e.target.tagName == 'INPUT' && e.target.type == 'image')
      e.preventDefault();

  }
});

$(document).ready(function(){
	disableImgDraggable();
});
function disableImgDraggable(){
	$('img').each(function(){
		$(this).attr('draggable',false);
	});
}