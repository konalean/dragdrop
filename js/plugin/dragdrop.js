/**
 * 拖拽plugin
 *
 * @author kon
 */
var _setting = {};
var dragdrop_html = '';
function get_dragdrop_html() {
	return dragdrop_html;
}

function dragdropItemRemove(removeItem) {
	_setting.dragdropItemRemove(removeItem);
}

$.fn.dragdrop = function(setting) {
	
	var is_mousedown = false;
	var dragdrop_element_created = false;
	var start_x = 0;
	var end_x = 0;
	var start_y = 0;
	var end_y = 0;
	var is_on_target = false;
	
	var _default = {
		destTarget: undefined, 
		dragdropDone: function() {
			if(_setting.destTarget!=undefined) {
				var append_html = get_dragdrop_html();
				_setting.destTarget.append(append_html);
			}
		},
		dragdropCancel: function() {
			
		},
		
		dragdropItemRemove: function(removeItem) {
			$(removeItem).parent().remove();
		},

	
		//重設dragdrop為初始值
		dragdrop_reset: function() {
			is_mousedown = false;
			dragdrop_element_created = false;
			$('#dragdrop_obj').remove();
			$('body').unbind('mousemove');
			$('body').unbind('mouseup');
			$(window).unbind('keydown');
			if(_setting.destTarget!=undefined) {
				_setting.destTarget.removeClass('dest_on');
			}
			dragdrop_html = '';
		},
	
		//建立dragdrop元素
		create_dragdrop_element: function(x, y, width, height, dragdropObj, marginLeft, marginTop) {
			var locationObj = _setting.compute_location(x, y, width, height, marginLeft, marginTop);
			
			var dragdropObjClass = $(dragdropObj).attr('class');
			var dragdropObjStyle = $(dragdropObj).attr('style');
			
			var dragdropClass = '';
			var dragdropStyle = '';
			if(dragdropObjClass != undefined) {
				dragdropClass = 'class="' + dragdropObjClass + '"';
			}
			
			if(dragdropObjStyle != undefined) {
				dragdropStyle = 'style="' + dragdropStyle + ';position:absolute;cursor:pointer"';
			}
			else {
				dragdropStyle = 'style="position:absolute;cursor:pointer;"';
			}
			
			var html = $(dragdropObj).html();
			var dragdrop_element = '<div id="dragdrop_obj" ' + dragdropClass + ' ' + dragdropStyle +'>'+ html +'</div>';
			
			dragdrop_html = dragdropObj;
			$('body').append(dragdrop_element).promise().done(function() {
				$('#dragdrop_obj').css({"top": locationObj.y, "left": locationObj.x, "width": width, "height": height});
				
				dragdrop_element_created = true;
				$('body').on("mousemove", function(event) {
					if(is_mousedown && dragdrop_element_created) {
						var moveX = event.pageX;
						var moveY = event.pageY;
						locationObj = _setting.compute_location(moveX, moveY, width, height, marginLeft, marginTop);
						$('#dragdrop_obj').css('top', locationObj.y).css('left', locationObj.x);
						
						//檢查是否已拉到目的元素，代表在chatroom上
						if(_setting.destTarget!=undefined) {
							if((moveX>=start_x && moveX<=end_x) && (moveY>=start_y && moveY<=end_y)) {
								is_on_target = true;
								_setting.destTarget.addClass('dest_on');
							}
							else {
								is_on_target = false;
								_setting.destTarget.removeClass('dest_on');
							}
						}
					}
				}).on("mouseup", function(event) {
						if(is_on_target) {
							//在目的地則做自訂dragdropDone function
							_setting.dragdropDone();
						}
						else {
							_setting.dragdropCancel();
						}
						_setting.dragdrop_reset();				
				});
				
				if(_setting.destTarget!=undefined) {
					var target_width = _setting.destTarget.width();
					var target_height =  _setting.destTarget.height();
					if(target_width>0 && target_height>0) {
						var element_offset = _setting.destTarget.offset();
						start_x = element_offset.left;
						end_x = start_x + target_width;
						
						start_y = element_offset.top;
						end_y = start_y + target_height;
					}
				}
				
				$(window).on('keydown', function(event) {
					_setting.dragdrop_reset();
				});
			});
		},

		//計算位址
		compute_location: function(x, y, width, height, marginLeft, marginTop) {
			var locationObj = {};
			locationObj.x = x - (width / 2) - marginLeft;
			locationObj.y = y - (height / 2) - marginTop;
			return locationObj;
		},
		


	};
	
	_setting = $.extend(_default, setting);
	
	

	//綁定dragdrop plugin
	return this.each(function() {
		$(this).on("mousedown", function(event) {
			var x = event.pageX;
			var y = event.pageY;
			is_mousedown = true;
		}).on("mousemove", function(event) {
			if(is_mousedown && !dragdrop_element_created) {
				var x = event.pageX;
				var y = event.pageY;
				var width = $(this).width();
				var height = $(this).height();
				var marginLeft = parseInt($(this).css('margin-left'));
				var marginTop = parseInt($(this).css('margin-top'));
				_setting.create_dragdrop_element(x, y, width, height, this, marginLeft, marginTop);
			}
		}).on("mouseup", function(event) {
			_setting.dragdrop_reset();
		});
		
	});
}