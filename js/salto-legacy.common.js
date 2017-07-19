	
	Function.prototype.calledOn = function(objInstance) {
		var functionObj = this;
		return function() {
			return functionObj.apply(objInstance, arguments);
		}
	};
	
	$(function() {
	
		$('body').addClass('fx');	
	
		$('.targeting').each(function() {
			var link = $(this).find('a');
			if (link.attr('title')) $(this).attr('title', link.attr('title'));
			$(this).click(function() {
				window.location = link.attr('href');
			});
			$(this).hover(function() {
				$(this).addClass('targeting-hover');
			}, function() {
				$(this).removeClass('targeting-hover');
			});
		});

		$('input.radio.rating').rating();

		$('.fx-notification-toggle').each(function() {
			var form = $(this).find('form');
			form.find('input:submit').hide();
			form.find('input:checkbox').click(function() {
				form.submit();
			});
			form.find('select').change(function() {
				if (form.find('input:checkbox:checked').size()) {
					form.submit();
				}
			});
		});
		
		var lastLi;
		$('.site-navigation-top').find('li').hover(function() {
			$(this).addClass('hover');
		}, function() {
			$(this).removeClass('hover');
		});
		
		$('.fx-tools-stage').each(function() {
			var stage = $(this);
			var tools = stage.find('.fx-tool').hide();
			var links = stage.find('.fx-tool-toggle-handle');

			links.click(function() {
				var link = $(this);
				document.location.replace(link.find('a:first').attr('href'));
			});

			var pendingMouseover;
			var pendingMouseout;

			links.mouseover(function() {
				var nativeLinkLi = this;
				var link = $(nativeLinkLi);
				var index = links.index(nativeLinkLi);
				var tool = tools.eq(index);

				if (pendingMouseover) window.clearTimeout(pendingMouseover);
				if (pendingMouseout) window.clearTimeout(pendingMouseout);

				if (link.hasClass('tool-toggle-handle-active')) return;

				pendingMouseover = window.setTimeout(function() {
					links.removeClass('tool-toggle-handle-active');
					link.addClass('tool-toggle-handle-active');

					tools.animate({
						opacity: 0
					}, {
						queue: false,
						duration: 700
					});
					tool.show().animate({
						opacity: 1
					}, {
						duration: 700,
						complete: function() {
							tools.css({zIndex: 10});
							tool.css({zIndex: 150});
						}
					});
				}, 100);
			});
			links.mouseout(function() {
				var nativeLinkLi = this;
				var link = $(nativeLinkLi);

				if (pendingMouseout) window.clearTimeout(pendingMouseout);

				pendingMouseout = window.setTimeout(function() {
					var next = link.next();
					if (!next.size()) next = links.eq(0);
					next.mouseover().mouseout();
				}, 9000);
			});
			links.eq(0).mouseover().mouseout();
		});

		$('a.popup').click(function() {
			var link = $(this);
			var popup = $('body').append('<div></div>').children(':last').hide();
			popup.load(link.attr('href') + ' .site-content .running-text', function() {
				$(this).dialog({
					width: 600,
					modal: true
				});
			});
			return false;
		})
	});
