// Only used by Call for Trainers!
$(function () {
	$('textarea.fx-wysiwyg').each(function () {
		CKEDITOR.replace($(this).attr('name'), {
			forcePasteAsPlainText: true, //siehe config.js
			customConfig: '', //nicht config.js laden
			contentsCss: WFD_STATIC_COMMON + 'styles/typography.css',
			//deaktiviert wegen Problem siehe case 16776     resize_dir: 'both', //nach unten und rechts vergrößerbar
			toolbar: [
				[ 'Styles' ],
				[ 'Bold', 'Italic' ],
				[ 'BulletedList' ],
				[ 'Link', 'Unlink' ]
			],
			stylesSet: [
				// TODO
				{ name: 'Normal', element: 'p', styles: {  } },
				{ name: 'Heading', element: 'h3', styles: {  } }
			],
			entities_latin: false,
			entities_greek: false,
			entities_processNumerical: 'force'
		});
	})
});