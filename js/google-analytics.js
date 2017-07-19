(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-86978810-1', 'auto');
ga('set', 'anonymizeIp', true);
ga('send', 'pageview');


/**
 * Send an event to Google Analytics when a file download link is clicked.
 * All file types that are to be tracked for download requests need to be specified in
 * the filetypes variable.
 * Disclaimer: It takes some time (around 48h) for events to be listed under "Behaviour" -> "Events"
 * in Google Analytics but you can see them right away in the real-time tracking view.
 */
$(document).ready(function () {
    var filetypes = /\.(zip|exe|dmg|pdf|doc.*|xls.*|ppt.*|mp3|txt|rar|wma|mov|avi|wmv|flv|wav)$/i;

    $('a').on('click', function (event) {
        var link = $(this);
        var href = (typeof(link.attr('href')) != 'undefined' ) ? link.attr('href') : "";
        if (href.match(filetypes)) {
            var fileExtension = (/[.]/.exec(href)) ? /[^.]+$/.exec(href) : undefined;
            ga('send', {
                hitType: 'event',
                eventCategory: 'Download',
                eventAction: 'click-' + fileExtension[0],
                eventLabel: href
            });
        }
    });
});
