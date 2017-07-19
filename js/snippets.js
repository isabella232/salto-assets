$(function() {
    $('.fx-snippets').each(function() {
        var snippetDefinitionStage = $(this);
        var snippetDefinitions = snippetDefinitionStage.find('*[id^="snippet-"]');
        if (snippetDefinitions.size()) {
            var snippets = {};
            snippetDefinitions.each(function() {
                var snippetDefinition = $(this);
                var snippetIdentifier = snippetDefinition.attr('id').substr(8);
                snippets[snippetIdentifier] = snippetDefinition.text();
            });

            var targetFields = $('.fx-content textarea');
            targetFields.each(function() {
                var field = $(this);
                field.keyup(function() {
                    $.each(snippets, function(identifier, snippet) {
                        var text = field.val();

                        var regexp = new RegExp(identifier + '#');
                        if (text.match(regexp)) {
                            field.val(
                                field.val().replace(identifier + '#', snippet)
                            );
                        }
                    });
                });
            });
        }
    });
})