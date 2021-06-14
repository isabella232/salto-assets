$(function() {
    $('.targeting').each(function() {
        var targetingZone = $(this);
        var link = targetingZone.find('a.targeting-target');

        if (link.size()) {
            link.before('<span class="targeting-target-replacement">' + link.html() + '</span>');
            link.hide();

            if (link.attr('title'))
                targetingZone.attr('title', link.attr('title'));

            targetingZone.click(function(event) {
                if (event.target != link.get(0))
                    if (link.triggerHandler('click') !== false)
                        window.location.href = link.attr('href');
            });
            targetingZone.removeClass('targeting');
            targetingZone.addClass('targetted');
        } else {
            targetingZone.attr('class', targetingZone.attr('class').replace(/targeting[-\w]*/g, ''));
        }
    });

})
