
var showDialog = function(target, title) {
    target.dialog({
        modal: true,
        width: 750,
        title: title,
        buttons: {
            'Close': function() {
                target.dialog('close');
            }
        },
        open: function() {
            target.dialog('widget').find('.ui-dialog-content').scrollTop(0);
        },
        close: function() {
            $('.ui-widget-overlay').die('click');
        }
    });
};

$(function() {

	$('.list-sorting-navigation').each(function() {
		var stage = $(this);
		var list = stage.find('ul');
		list.hide();

		var dropDown = list.after('<select></select>').next();
		list.children().each(function() {
			var li = $(this);
			var link = li.find('a');
			var option = dropDown.append('<option>' + li.text() + '</option>').children(':last').data('link', link);
			if (!link.size()) {
				option.attr('selected', 'selected');
			}
		});

		dropDown.change(function() {
			var select = $(this);
			var link = select.find('option:selected').data('link');
			if (link.size()) {
				document.location.replace(link.attr('href'));
			}
		});
	});

	$('.fx-new-tab').click(function() {
		window.open($(this).attr('href'));
		return false;
	});

	$('.fx-info-dialog').click(function() {
		var link = $(this);
		var title = "More information";
		var dialog = $('<div></div>');
		dialog.load(link.attr('href') + ' .site-content', null, function() {
            initializeForm(dialog);
			showDialog(dialog, title);
		});
		return false;
	});

	$('.fx-dialog').click(function() {
		var link = $(this);
		var title = link.attr('title');
		var dialog = $('<div></div>').css('maxHeight', ($(window).height() * 0.8) + 'px');
		dialog.load(link.attr('href') + ' .fx-content:first', null, function() {
			$('.ui-widget-overlay').live('click', function() {
				dialog.dialog( "close" );
            });
            initializeForm(dialog);
			showDialog(dialog, title);
		});
		return false;
	});

	$('.fx-detail').each(function() {
		var reg = new RegExp('^(http|https):\/\/' + location.hostname + '\/.*(\/search\/|\/browse\/)');
		if (document.referrer.match(reg)) {
			$(this).after('<p><a class="link">Back to previous list</a></p>').next().click(function() {
				history.back();
			});
		}
	});

	$('.fx-html-mail-preview').each(function() {
        var stage = $(this);
        var html = stage.text();
        var iframe = stage.html('<iframe src="about:blank" width="100%" height="300"></iframe>').children(':first');
        var document = iframe.contents().find('body');
        document.append(html);
	});

    $('.fx-mail-preview-link').each(function() {
        var link = $(this);
        var form = link.parents('form');
        var stage = $('body').append('<div style="display: none"><iframe src="about:blank" width="100%" height="600"></iframe></div>').children(':last');
        var url = link.attr('href');
        if (!url.match(/\?/)) {
            url += '?';
        } else {
            url += '&';
        }
        link.click(function() {
            stage.find('iframe').attr('src', url + form.serialize());
            showDialog(stage, 'Email preview');
            return false;
        });
    });

	$('.fx-rating-form').each(function(ratingFormIndex) {
		var originalForm = $(this).hide();
		var newForm = originalForm.after('<div></div>').next();

		originalForm.children().each(function(optionIndex) {
			var oldOption = $(this);
			var newOption = newForm.append('<input type="radio" name="rating-form-' + ratingFormIndex + '" value="' + optionIndex + '" />').children(':last');
			if (oldOption.find('.fx-users-rating').size()) {
				newOption.attr('checked', 'checked');
			}
		});

		newForm.find('input').rating({
			required: true,
			callback: function(value) {
				originalForm.children().eq(value).find('form').submit();
			}
		});
	});

	$('.expandable-text').each(function() {
		var expandableText = $(this);
		var height = expandableText.height();
		expandableText.css({height: '10.5em'});
		if (expandableText.height() > height) {
			expandableText.css({
				height: height + 'px'
			});
		} else {
			$(this).after('<p class="view-more">... <a href="#" class="link">view more</a></p>');
			$(this).after('<p class="view-less"><a href="#" class="link">view less</a></p>');
			var viewMoreLink = $(this).parent().find('.view-more a');
			var viewLessLink = $(this).parent().find('.view-less a');
			viewMoreLink.click(function() {
				viewMoreLink.parent().hide();
				expandableText.animate({
					height: height + 'px'
				}, 3000);
				viewLessLink.parent().show();
				return false;
			});
			viewLessLink.click(function() {
				viewLessLink.parent().hide();
				expandableText.animate({
					height: '10.5em'
				}, 3000);
				viewMoreLink.parent().show();
				return false;
			});
			viewLessLink.click();
		}
	});

    $('.fx-viewcount-hit-form').each(function() {
        var form = $(this).hide();
        $.post(form.attr('action'));
    });

    $('.faceted-search-form .fx-tag-cloud').each(function() {
        var tagCloud = $(this);
        var smallTags = tagCloud.find('.tag-cloud-level-1, .tag-cloud-level-2').not('.tag-selected').hide();
        var toggle = tagCloud.after('<a class="link microcopy">&#9662; more keywords</a>').next();
        toggle.click(function() {
            toggle.remove();
            smallTags.show();
        });
    })
});
