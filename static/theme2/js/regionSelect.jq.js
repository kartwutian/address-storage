;(function($) {
	$.fn.RegionList = function(o) {
		var defaults = {
			
			regionUrl: o.regionUrl || ["province.js", "city.js", "district.js"]
			//resultCall: o.resultCall,
			//Storage: o.Storage || false
		};
		var init = $.extend(defaults, o);
		var regionSelect = $(this);

		if(init.defaultRegion){
			
			var defaultNo = init.defaultRegion[0];
			var defaultRegionName = init.defaultRegion[1];

			// console.log(defaultNo);
			// console.log(defaultRegionName);
			
			regionSelect.text(defaultRegionName.join(' '));
			init.valueStore.val(defaultRegionName.join(' '));

		}
		
		var $body = $("body,html"),
			cl = "click",
			isOpen = false;//避免每次点击regionSelect都要加载getRegionList(0);
		var $floor = $("<div class='address_floor'><header class='address_floor_head'><a href='javascript:;' class='address_back'></a><p>地址选择</p></header><div class='address_content'><ul class='address_nav'><li class='on'>选择省</li><li>选择市</li><li>选择区县</li></ul><div class='address_box'><ul class='address_item'></ul><ul class='address_item'></ul><ul class='address_item'></ul></div></div></div>"),
			$loading = $("<div class='loading_mask'></div>");
		$loading.appendTo($floor);
		$floor.appendTo("body");
		var $back = $floor.find("a.address_back"),
			$box = $floor.find(".address_box"),
			$tab_btn = $floor.find(".address_nav li");
		//限制高度	
		$box.height(parseInt($(window).height()) - parseInt($box.css("top")));
		//选择器绑定点击事件
		
		regionSelect.on(cl, function() {
			$floor.show();
			setTimeout(function() {
				$floor.addClass("toggle")
			}, 10);
			$body.css("overflow-y", "hidden");
			if(!isOpen) {
				getRegionList(0);
				isOpen = true;
			}
		});
		$back.on(cl, function(e) {
			e.preventDefault();
			$floor.removeClass("toggle");
			setTimeout(function() {
				$floor.hide()
			}, 500);
			$body.css("overflow-y", "");
		});
		$tab_btn.on(cl, function() {
			$(this).addClass("on").siblings().removeClass("on");
			var index = $(this).index();
			$box.children().eq(index).show().siblings().hide();
		});

		function showLoading() {
			$loading.show()
		};

		function hideLoading() {
			$loading.hide()
		};

		function toggleList(a) {
			var parent = a.parent(),
				index = parent.index(),
				Text = a.text(),
				regionData = a.attr("region-data");//地区编号

			$tab_btn.eq(index).text(Text).attr("region-data",regionData);//增加地区编号

			if(index != 2) {
				parent.hide();
				parent.next().show();
				$tab_btn.eq(index + 1).addClass("on").siblings().removeClass("on");
			}
		};

		function getRegionList(n, k) {
			if(init.Storage) {
				var Storage = window.localStorage;
				if(Storage) {
					if(!Storage.getItem("region")) {
						Storage.setItem("region", '[]');
						loadRegionList.apply(this, arguments)
					} else {
						var o = JSON.parse(Storage.getItem("region"));
						if(o.length === 3) {
							showLoading();
							addRegionLi(n, o, k, true);
						} else {
							loadRegionList.apply(this, arguments)
						}
					}
				} else {
					loadRegionList.apply(this, arguments)
				}
			} else {
			console.log(n,k);
				loadRegionList.apply(this, arguments)
			}
		};

		function loadRegionList(n, k) {
			$.ajax({
				type: "get",
				url: "static/theme2/js/" + init.regionUrl[n],
				dataType: "json",
				beforeSend: showLoading,
				success: function(o) {
					setLoadStorage(n, o);
					cleanUl(n);
					addRegionLi(n, o, k, false);
				},
				error: function() {
					Alert("数据加载错误！");
					hideLoading();
				}
			})
		};

		function addRegionLi(n, o, k, isStorage) {
			//n为列数，o为数据对象，k为数据对象中的子对象的No
			setTimeout(function() {
				cleanUl(n);
				var data;
				if(isStorage) {
					data = n == 0 ? o[n] : o[n][0][k];
				} else {
					data = n == 0 ? o : o[0][k];
				}
				for(var i in data) {
					var li = "<li></li>";
					$box.children().eq(n).append(li);
					var _li = $box.children().eq(n).children();
					
					_li.eq(i).text(data[i].name);
					_li.eq(i).attr("region-data", data[i].No);
					setEvent(_li.eq(i));

					if(init.defaultRegion){
						if(defaultNo[n] == data[i].No){
							var defaultIndex = i;
						}
					}		
				}

				// console.log(_li.eq(defaultIndex).attr("region-data"));
				if(init.defaultRegion){
					setDefault(_li.eq(defaultIndex));
				}
				

				hideLoading();
			}, 300);
			
		};

		function cleanUl(n) {
			$box.children().eq(n).empty()
		};

		function setLoadStorage(n, d) {
			if(init.Storage) {
				var Storage = window.localStorage;
				if(Storage) {
					if(!Storage.getItem("region")) {
						Storage.setItem("region", '[]')
					} else {
						var data = JSON.parse(Storage.getItem("region"));
						data[n] = d;
						Storage.setItem("region", JSON.stringify(data))
					}
				}
			}
		};

		function setDefault(e){
			e.addClass("checked").siblings().removeClass("checked");
			toggleList(e);
			var num = e.attr("region-data");
			var i = e.parent().index();
							
			if(i == 2) {
				return
			} else {
				var sel_ul = $box.children(),
					dis_ul = sel_ul.eq(2),
					tab = $tab_btn;
				if(i == 0) {
					if(dis_ul.children().length > 0) {
						tab.eq(1).text("选择市");
						tab.eq(2).text("选择区县");
						sel_ul.eq(1).children().removeClass("checked")
						dis_ul.empty()
					}
				}
				if(i == 1) {
					tab.eq(2).text("选择区县");
					dis_ul.children().removeClass("checked")
				}
			}
			getRegionList(i + 1, num);

		};

		function setEvent(e) {

			e.on(cl, function() {
				init.defaultRegion = false;
				e.addClass("checked").siblings().removeClass("checked");
				toggleList(e);
				var i = e.parent().index();
				if(i == 2) {
					getResult()
					return
				} else {
					var sel_ul = $box.children(),
						dis_ul = sel_ul.eq(2),
						tab = $tab_btn;
					if(i == 0) {
						if(dis_ul.children().length > 0) {
							tab.eq(1).text("选择市");
							tab.eq(2).text("选择区县");
							sel_ul.eq(1).children().removeClass("checked")
							dis_ul.empty()
						}
					}
					if(i == 1) {
						tab.eq(2).text("选择区县");
						dis_ul.children().removeClass("checked")
					}
				}
				var num = $(this).attr("region-data");
				getRegionList(i + 1, num);
				});
		};

		function getResult() {
			var result =[],
					resultNo =[],
					resultName=[],
					res_txt;
			showLoading();
			if(regionSelect.children().length > 0) {
				var span = regionSelect.find("span");
				for(var i = 0, len = span.length; i < len; i++) {
					span[i].innerText = $tab_btn[i].innerText;
				}
			} else {
				for(var i = 0, len = $tab_btn.length; i < len; i++) {
					resultNo[i] = $($tab_btn[i]).attr("region-data");
					resultName[i] = $($tab_btn[i]).text();
						
				}
				result[0] = resultNo;
				result[1] = resultName;
				// console.log(resultNo);
				// console.log(resultName);
				// console.log(result);
				
				

				res_txt = resultName.join(" ");
				regionSelect.text(res_txt);
				init.valueStore.val(res_txt);
				
			}
			setTimeout(function() {
				$back.trigger(cl);
				hideLoading();
			}, 300);
			if(init.resultCall && typeof init.resultCall === "function") {
				init.resultCall(result); //传入结果
			}
		};

	};
})(jQuery);