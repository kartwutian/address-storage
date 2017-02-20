window.RegionList = (function($) {
	if(!window.Alert) window.Alert = window.alert;
	var g = function() {
		this.body = $("body,html");
		this.cl = "click";
		this.isOpen = false;
	};
	g.prototype = {
		init: function(a) {
			a = a || {};
			this.regionSelect = $(a.regionSelect || "#selectRegionBtn");
			this.regionUrl = a.regionUrl || ["province.js", "city.js", "district.js"];
			this.resultCall = a.resultCall;
			this.Storage = a.Storage || false;
			this.bindEvent();
		},
		bindEvent: function() {
			this.addMaskFloor();
			this.setBoxheight();
			this.setBtnTrigger();
			this.closeFloor();
			this.switchList();
		},
		addMaskFloor: function() {
			this.floor = $("<div class='address_floor'><header class='address_floor_head'><a href='javascript:;' onclick='history.go(-1)' class='address_back'></a><p>地址选择</p></header><div class='address_content'><ul class='address_nav'><li class='on'>选择省</li><li>选择市</li><li>选择区县</li></ul><div class='address_box'><ul class='address_item'></ul><ul class='address_item'></ul><ul class='address_item'></ul></div></div></div>");
			this.loading = $("<div class='loading_mask'></div>");
			this.loading.appendTo(this.floor);
			this.floor.appendTo("body");
			this.back = this.floor.find("a.address_back");
			this.box = this.floor.find(".address_box");
			this.tab_btn = this.floor.find(".address_nav li");
		},
		setBoxheight: function() {
			var _self = this;
			var H = parseInt($(window).height()),
				T = parseInt(_self.box.css("top"));
			_self.box.height(H - T);
		},
		setBtnTrigger: function() {
			var _self = this;
			_self.regionSelect.on(_self.cl, function() {
				_self.floor.show();
				setTimeout(function() {
					_self.floor.addClass("toggle")
				}, 10);
				_self.body.css("overflow-y", "hidden");
				if(!_self.isOpen) {
					_self.getRegionList(0);
					_self.isOpen = true;
				}
			});
		},
		showLoading: function() {
			this.loading.show()
		},
		hideLoading: function() {
			this.loading.hide()
		},
		closeFloor: function() {
			var _self = this;
			_self.back.on(_self.cl, function(e) {
				e.preventDefault();
				_self.floor.removeClass("toggle");
				setTimeout(function() {
					_self.floor.hide()
				}, 500);
				_self.body.css("overflow-y", "");
			})
		},
		switchList: function() {
			var _self = this;
			_self.tab_btn.on(_self.cl, function() {
				$(this).addClass("on").siblings().removeClass("on");
				var index = $(this).index();
				_self.box.children().eq(index).show().siblings().hide();
			})
		},
		toggleList: function(a) {
			var _self = this,
				parent = a.parent(),
				index = parent.index(),
				Text = a.text();
			a.addClass("checked").siblings().removeClass("checked");
			_self.tab_btn.eq(index).text(Text);
			if(index != 2) {
				parent.hide();
				parent.next().show();
				_self.tab_btn.eq(index + 1).addClass("on").siblings().removeClass("on");
			}
		},
		getRegionList: function(n, k) {
			var _self = this;;
			if(_self.Storage) {
				var Storage = window.localStorage;
				if(Storage) {
					if(!Storage.getItem("region")) {
						Storage.setItem("region", '[]');
						_self.loadRegionList.apply(this, arguments)
					} else {
						var o = JSON.parse(Storage.getItem("region"));
						if(o.length === 3) {
							_self.showLoading();
							_self.addRegionLi(n, o, k, true);
						} else {
							_self.loadRegionList.apply(this, arguments)
						}
					}
				} else {
					_self.loadRegionList.apply(this, arguments)
				}
			} else {
				_self.loadRegionList.apply(this, arguments)
			}
		},
		loadRegionList: function(n, k) {
			var _self = this;
			$.ajax({
				type: "get",
				url: "static/theme2/js/" + _self.regionUrl[n],
				dataType: "json",
				beforeSend: function() {
					_self.showLoading()
				},
				success: function(o) {
					_self.setLoadStorage(n, o);
					_self.cleanUl(n);
					_self.addRegionLi(n, o, k, false);
				},
				error: function() {
					Alert("数据加载错误！");
					_self.hideLoading();
				}
			})
		},
		addRegionLi: function(n, o, k, isStorage) {
			var _self = this;
			setTimeout(function() {
				_self.cleanUl(n);
				var data;
				if(isStorage) {
					data = n == 0 ? o[n] : o[n][0][k]
				} else {
					data = n == 0 ? o : o[0][k]
				}
				for(var i in data) {
					var li = "<li></li>";
					_self.box.children().eq(n).append(li);
					var _li = _self.box.children().eq(n).children();
					_self.setEvent(_li.eq(i));
					_li.eq(i).text(data[i].name);
					_li.eq(i).attr("region-data", data[i].No);
				}
				_self.hideLoading();
			}, 300)
		},
		cleanUl: function(n) {
			this.box.children().eq(n).empty()
		},
		setLoadStorage: function(n, d) {
			if(this.Storage) {
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
		},
		setEvent: function(a) {
			var _self = this;
			a.on(_self.cl, function() {
				var l = true;
				if($(this).hasClass("checked")) l = false;
				_self.toggleList($(this));
				var i = $(this).parent().index();
				if(i == 2) {
					_self.getResult()
					return
				} else {
					var sel_ul = _self.box.children(),
						dis_ul = sel_ul.eq(2),
						tab = _self.tab_btn;
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
				if(l) _self.getRegionList(i + 1, num);
			});
		},
		getResult: function() {
			var _self = this,
				result = [],
				res_txt;
			_self.showLoading();
			if(_self.regionSelect.children().length > 0) {
				var span = _self.regionSelect.find("span");
				for(var i = 0, len = span.length; i < len; i++) {
					span[i].innerText = _self.tab_btn[i].innerText;
				}
			} else {
				for(var i = 0, len = _self.tab_btn.length; i < len; i++) {
					result[i] = _self.tab_btn[i].innerText
				}
				res_txt = result.join(" ");
				_self.regionSelect.text(res_txt);
				_self.regionSelect.next().val(res_txt);
			}
			setTimeout(function() {
				_self.back.trigger(_self.cl);
				_self.hideLoading();
			}, 300);
			if(_self.resultCall && typeof _self.resultCall === "function") {
				_self.resultCall(res_txt) //传入结果
			}
		}
	}
	return g
})(jQuery);