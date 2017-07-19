$(function() {

    initializeForm($('body'));

});

var initializeForm = function(context) {

    context.find('.fx-form-generator').each(function() {
	    /* AddThis-Dropdown funktioniert nicht mit dem form-generator im IE9, ist hier aber ohnehin nicht sinnvoll (Case 13484) */
	    $('.fx-addthis-button').remove();


	    var row = $(this);
	    

	    //Im IE die Textmarkierung deaktivieren (Case 13632)
	    row.live('mousedown', function(event){
		    var target = $(event.target);
		    if(!target.is(':input')){
			    $(event.target).attr({onselectstart: 'return false;', unselectable: 'on'});
		    }
	    });
	    row.find('*:input').live('mousedown focusin',function(event){
		    $(event.target).parents().andSelf().attr({onselectstart: '', unselectable: 'off'});
	    });


        var textarea = row.find('textarea');
        textarea.hide();
        var previewUrl = row.find('.preview-url').text();

        var wrapper = textarea.after('<div class="form-generator clearfix"></div>').next();
	    
        var formDefinitionJson = textarea.val();
        if (formDefinitionJson) {
            var formDefinition = JSON.parse(textarea.val());
        } else {
            var formDefinition = {};
        }

        var pool = new WfFormGenerator.FieldPool();
        wrapper.append(pool.build());

        var generator = new WfFormGenerator.Form();
        generator.loadFromFormDefinition(formDefinition);
        wrapper.append(generator.build());

        var urlContainer = context.find('.fx-form-generator-preview-url');
        var previewUrl = urlContainer.text();
        urlContainer.html('').removeClass('hidden');

        var previewHandle = urlContainer.append('<span class="preview-handle button-icon button-view-component clearing">Preview form</span>').children(':last');
        var stage = urlContainer.append('<div></div>').children(':last').hide();
        previewHandle.click(function() {
            $.post(previewUrl, {'preview_questionnaire_definition': JSON.stringify(generator.buildDefinition())}, function(data, status, jqxhr) {
                stage.html('');
                var content = $(data).find('.fx-content:first');
                stage.append(content);
                initializeForm(stage);
                showDialog(stage, 'Preview form');
            });
        });

        generator.dom.bind(WfFormGenerator.FIELD_EDIT_REQUESTED, function(event, field){

        });

        textarea.closest('form').submit(function() {
            textarea.val(JSON.stringify(generator.buildDefinition()));
        });
    });

    context.find('.fx-collapsed-form').each(function() {
        var form = $(this).find('form').hide();
        var actionButtons = $(this).find('.fx-collapsed-form-actions');
        var refineSearchButton = actionButtons.find('.fx-collapsed-form-refine-search').removeClass('hidden');

        refineSearchButton.click(function() {
            form.toggle();
        });
    });

    context.find('.fx-select-with-text-option').each(function() {
        var select = $(this);
        var metadata = select.metadata();
        var map = {};
        map[metadata.textOptionValue] = metadata.textFieldClass;
        dropDown(select.attr('name'), map);
    });

    var visitedRadioGroups = [];
    context.find('.fx-radio-toggle').each(function() {
        var currentName = $(this).attr('name');
        if ($.inArray(currentName, visitedRadioGroups) == -1) {
            visitedRadioGroups.push(currentName);

            var map = {};
            context.find('input:radio[name="' + currentName + '"]').each(function() {
                var radio = $(this);
                var value = radio.val();
                var target = radio.metadata().toggleTarget;
                map[value] = target;
            });

            radio(currentName, map);
        }
    });

    context.find('.fx-form-components').each(function() {
        var stage = $(this);
        var templates = stage.find('.fx-templates');
        var components = stage.find('.fx-form-component');
        var relevantFormFieldsSelector = 'textarea, select, input:not(.fx-form-component-delete-input)';
        var metaData = stage.metadata();

        var requiredComponents = parseInt(metaData.requiredComponents);
        var autoAddOnSubmit = parseInt(metaData.autoAddOnSubmit);

        var addButton = stage.append(templates.find('.fx-form-component-add').clone()).children(':last').find('.fx-form-component-add-input');

        var uniqueSelection = components.find('.fx-form-component-unique-value').eq(0).clone();
        uniqueSelection.attr('name', '');
        uniqueSelection.val('');
        addButton.before(uniqueSelection);

        components.each(function(index) {
            var component = $(this).hide();
            var include = component.find('.fx-form-component-include').hide();
            var includeCheckbox = include.find('.fx-form-component-include-input');
            component.data('includeCheckbox', includeCheckbox);

            if (uniqueSelection.size()) {
                component.data('uniqueValue', component.find('.fx-form-component-unique-value').hide());
                component.data('uniqueValueDisplay', component.data('uniqueValue').after('<span></span>').next());
                component.data('uniqueValue').change(function() {
                    var uniqueValue = $(this);
                    var display = uniqueValue.next();
                    display.html(uniqueValue.find('option:selected').text());
                }).change();
            }

            var deleteButton = component.append(templates.find('.fx-form-component-delete').clone()).children(':last').find('.fx-form-component-delete-input');
            component.data('deleteButton', deleteButton);
            deleteButton.click(function() {
                var current = component;

                if (uniqueSelection.size()) {
                    uniqueSelection.find('option[value="' + current.data('uniqueValue').val() + '"]').removeAttr('disabled');
                }

                current.find(relevantFormFieldsSelector).val('').change();
                current.find('.fx-form-component-readonly').remove();
                current.data('includeCheckbox').removeAttr('checked');
                current.hide();

                addButton.show();
                uniqueSelection.show();
            });
        });

        addButton.click(function() {
            components.each(function() {
                var component = $(this);
                if (!component.data('includeCheckbox').is(':checked')) {
                    if (uniqueSelection.size()) {
                        var componentUniqueValue = component.data('uniqueValue').val();
                        if (uniqueSelection.val()) {
                            component.data('uniqueValue').val(uniqueSelection.val()).change();
                            uniqueSelection.find('option:selected').attr('disabled', 'disabled');
                            uniqueSelection.val('');
                        } else if (componentUniqueValue) {
                            uniqueSelection.find('option[value="' + componentUniqueValue + '"]').attr('disabled', 'disabled');
                        } else {
                            return false;
                        }
                    }

                    component.data('includeCheckbox').attr('checked', 'checked');

                    component.show();
                    return false;
                }
            });
            if (!components.filter(':not(:visible)').size()) {
                addButton.hide();
                uniqueSelection.hide();
            }
        });

        var visibleComponents = Math.max(requiredComponents, components.find('.fx-form-component-include-input:checked').size());
        components.slice(0, visibleComponents).each(function() {
            var component = $(this);
            component.data('includeCheckbox').removeAttr('checked');
            addButton.click();
        });

        if (!components.filter(':not(:visible)').size()) {
            addButton.hide();
        }

        if (autoAddOnSubmit) {
            stage.closest('form').submit(function() {
                addButton.click();
            });
        }
    });

    context.find('.fx-form-multiplechoice').each(function() {
        var stage = $(this);
        var templates = stage.find('.fx-templates');
        var choices = stage.find('.fx-form-choice').hide();
        var addChoice = stage.append(templates.find('.fx-form-choice-add').clone()).children(':last');

        var maximumChoices = stage.metadata().maximumChoices;
        if (!maximumChoices)
            maximumChoices = choices.size();

        var addChoiceSelect = addChoice.find('.fx-form-choice-add-select');
        var optionsHtml = '';
        choices.each(function(index) {
            var choice = $(this);
            var value = choice.find('.fx-form-choice-value').val();
            var label = choice.find('.fx-form-choice-label');
            choice.data('value', value);
            optionsHtml += '<option class="' + index + '" value="' + value + '">' + label.text() + '</option>';
        });
        addChoiceSelect.append(optionsHtml);

        var addChoiceButton = addChoice.find('.fx-form-choice-add-input');
        addChoiceButton.click(function() {
            var value = addChoiceSelect.val();
            if (!value) return;

            var option = addChoiceSelect.find('option[value="' + value + '"]');
            option.attr('disabled', 'disabled');

            addChoiceSelect.val('');

            var checkbox = choices.find('input[value="' + value + '"]');
            checkbox.attr('checked', 'checked');

            var selectedInformation = addChoice.before(templates.find('.fx-form-choice-selected').clone()).prev();
            selectedInformation.find('.fx-form-choice-selected-slot').append(option.text());
            var deleteButton = selectedInformation.find('.fx-form-choice-selected-delete-input');
            deleteButton.click(function() {
                checkbox.removeAttr('checked');
                option.removeAttr('disabled');
                selectedInformation.remove();
                if (addChoiceSelect.find('option:disabled').size() < maximumChoices) {
                    addChoice.show();
                }
	            stage.trigger('fx-form-multiplechoice-change');
            });

            if (addChoiceSelect.find('option:disabled').size() >= maximumChoices) {
                addChoice.hide();
            }
	        
	        stage.trigger('fx-form-multiplechoice-change');
        });

        choices.each(function() {
            var choice = $(this)
            var checkbox = choice.find('input');
            if (checkbox.is(':checked')) {
                addChoiceSelect.val(choice.data('value'));
                addChoiceButton.click();
            }
        });

        stage.closest('form').submit(function() {
            addChoiceButton.click();
        });
    });

    context.find('.fx-date').datepicker({
        dateFormat: 'yy-mm-dd',
        yearRange: 'c-100:c+10'
    });

    context.find('.fx-hide-next').each(function() {
        var row = $(this);
        var next = row.next();
        var checkbox = row.find('.fx-hide-next-toggle');

        var checkboxToggle = function() {
            if (checkbox.is(':checked')) {
                next.show();
            } else {
                next.hide();
            }
        };

        checkbox.click(checkboxToggle);
        checkboxToggle();
    });

    context.find('.fx-textarea-count').each(function() {
        var row = $(this);
        var text = row.find('textarea');
        var counter = row.find('.counter');
        var maxCharacters = parseInt(counter.text());

        var charactersLeft;

        var update = function() {
            charactersLeft = maxCharacters - text.val().length;
            counter.text(charactersLeft);
            if (charactersLeft < 0) {
                counter.addClass('counter-minus');
            } else {
                counter.removeClass('counter-minus');
            }
        }

        text.keyup(function() {
            update();
        }).keyup();

        text.keypress(function(event) {
            update();
            if ((charactersLeft <= 0) && ($.inArray(event.keyCode, [
                $.ui.keyCode.BACKSPACE,
                $.ui.keyCode.INSERT,
                $.ui.keyCode.SHIFT,
                $.ui.keyCode.DELETE,
                $.ui.keyCode.LEFT,
                $.ui.keyCode.RIGHT,
                $.ui.keyCode.UP,
                $.ui.keyCode.DOWN
            ]) == -1))
                return false;
        });
    });

    context.find('.fx-autocomplete-select').each(function() {
        var select = $(this).hide();
        var data = [];
        select.find('option').each(function() {
            var option = $(this);
            if (option.val()) {
                data.push(option.text());
            }
        });
        var input = select.after('<input type="text" />').next();
        input.autocomplete({
            source: data,
            select: function(event, ui) {
                select.val(
                    select.find('option:contains("' + ui.item.value + '")').val()
                );
            }
        });
    });

    context.find('.fx-tag-autocomplete').each(function() {
        var input = $(this);
        var metadata = input.metadata();
        var url = metadata.url;
        var parameterName = metadata.parameterName;

        input.autocomplete({
            minLength: 3,
            source: function( request, response ) {
                var parameters = {};
                parameters[parameterName] = request.term;
                $.ajax({
                    url: url,
                    dataType: "json",
                    data: parameters,
                    success: function( data ) {
                        response( $.map( data, function( item ) {
                            return {
                                label: item.tag,
                                value: item.tag
                            }
                        }));
                    }
                });
            }
        });
    });

    context.find('.fx-tags').each(function() {
        var section = $(this);
        var tagCloud = section.find('.tag-cloud');
        var tagCloudTags = tagCloud.find('.tag');
        var tagComponents = section.find('.fx-form-component');
        var addButton = section.find('.fx-form-component-add-input');

        tagCloudTags.click(function() {
            var tag = $(this);
            var tagComponent = tagComponents.filter(':not(:visible):first');
            if (!tag.is('.tag-selected') && tagComponent.size()) {
                addButton.click();
                tagComponent.find('input:text').val(tag.text()).keyup();
            }
        });

        tagComponents.find('input:text').keyup(function() {
            tagCloudTags.each(function() {
                var tagCloudTag = $(this);
                var tagCloudTagText = tagCloudTag.text();
                var found = false;
                tagComponents.each(function() {
                    var tagComponent = $(this);
                    var textField = $(this).find('input:text');
                    var tag = textField.val();
                    if (tagCloudTagText == tag) {
                        found = true;
                        return false;
                    }
                });
                tagCloudTag.removeClass('tag-selected');
                if (found) {
                    tagCloudTag.addClass('tag-selected');
                }
            });

        }).keyup();

        tagComponents.each(function() {
            var tagComponent = $(this);
            var deleteInput = tagComponent.find('.fx-form-component-delete-input');
            var textField = tagComponent.find('input:text');
            deleteInput.click(function() {
                textField.keyup();
            });
        });
    });

    context.find('.fx-keywords').each(function() {
        var section = $(this);
        var tagCloud = section.find('.tag-cloud');
        var tagCloudTags = tagCloud.find('.tag');
        var leftSide = section.find('.tag-selection:first').hide();
        var select = leftSide.find('select');
        var maximumChoices = section.find('.fx-form-multiplechoice').metadata().maximumChoices;
        if (!maximumChoices)
            maximumChoices = tagCloudTags.count();
        var addButton = section.find('.fx-form-choice-add-input');

        tagCloudTags.click(function() {
            var tag = $(this);
            var tagText = tag.text();
            if (!tag.is('.tag-selected')) {
                if (tagCloudTags.filter('.tag-selected').size() < maximumChoices) {
                    select.find('option').each(function() {
                        var option = $(this);
                        if (option.text() == tagText) {
                            select.val(option.attr('value'));
                            addButton.click();
                            tag.addClass('tag-selected');
                            return false;
                        }
                    });
                }
            } else {
                leftSide.find('.fx-form-choice-selected-slot').each(function() {
                    var display = $(this);
                    if (display.text() == tagText) {
                        display.next().click();
                        tag.removeClass('tag-selected');
                        return false;
                    }
                });
            }
        });

        leftSide.find('.fx-form-choice-selected-slot').each(function() {
            var tagText = $(this).text();
            tagCloudTags.each(function() {
                var tag = $(this);
                if (tag.text() == tagText) {
                    tag.addClass('tag-selected');
                }
            });
        });
    });

    context.find('.fx-checkbox-hierarchy-selection').each(function() {
        var checkboxHierarchyContainer = $(this);
        var hierarchyNodes = checkboxHierarchyContainer.find('li').addClass('fx-checkbox-hierarchy-node');
        var hierarchyNodesWithChildren = hierarchyNodes.has('ul');

        hierarchyNodesWithChildren.each(function() {
            var currentContainer = $(this);

            var expansionHandle = $('<div class="fx-checkbox-hierarchy-expansion-handle checkbox-hierarchy-expansion-handle"><span>Expand or collapse</span></div>');
            currentContainer.prepend(expansionHandle);

            expansionHandle.click(function() {
                if (currentContainer.is('.checkbox-hierarchy-collapsed')) {
                    expandContainer(currentContainer);
                } else {
                    collapseContainer(currentContainer);
                }
            });
        });

        if (checkboxHierarchyContainer.is('.fx-checkbox-hierarchy-selection-collapse-all')) {
            collapseContainer(hierarchyNodesWithChildren);
        }

        checkboxHierarchyContainer.find('input:checked').each(function() {
            var checkbox = $(this);
            var parentContainers = checkbox.parents('.fx-checkbox-hierarchy-node').not(checkbox.parent());
            updateHierarchyNode(checkbox);
            expandContainer(parentContainers);
        });

        checkboxHierarchyContainer.find('input').click(function() {
            updateHierarchyNode($(this));
        });

        function updateHierarchyNode(clickedInput) {
            var parentContainers = clickedInput.parents('.fx-checkbox-hierarchy-node');
            var firstParent = parentContainers.eq(0);
            var isChecked = clickedInput.is(':checked');

            if (firstParent.has('ul'))
                firstParent.find('input').attr('checked', isChecked);

            if (!isChecked) {
                var toggleInputs = parentContainers.find('> input');
                toggleInputs.attr('checked', false);
            } else {
                parentContainers.each(function() {
                    var parentContainer = $(this);
                    if (!parentContainer.find('ul').find('input:not(:checked)').size()) {
                        parentContainer.children('input').attr('checked', true);
                    }
                });
            }
        }

        function expandContainer(container) {
            container.removeClass('checkbox-hierarchy-collapsed');
            container.children('ul').show();
        }

        function collapseContainer(container) {
            container.addClass('checkbox-hierarchy-collapsed');
            container.children('ul').hide();
        }
    });

    var orderedDates = context.find('.fx-ordered-date');
    if (orderedDates.size()) {
        orderedDates.change(function() {
            var stringToDate = function(s) {
                if (s) {
                    var parts = s.split('.');
                    return new Date(parts[2], parts[1], parts[0]);
                }
                return null;
            }
            var dateToString = function(d) {
                if (d) {
                    return highestDate.getDate() + '.' + highestDate.getMonth() + '.' + highestDate.getFullYear();
                }
                return '';
            }
            var highestDate;
            orderedDates.each(function() {
                var dateField = $(this);
                var date = stringToDate(dateField.val());
                var orderedDateDistance = (distance = dateField.metadata().orderedDateDistance) ? distance : 0;
                if (!highestDate) {
                    highestDate = date;
                } else {
                    highestDate.setDate(highestDate.getDate() + orderedDateDistance);
                    if (!date || (date < highestDate)) {
                        dateField.val(dateToString(highestDate));
                    } else {
                        highestDate = date;
                    }
                }
            });
        });
        orderedDates.change();
    }

    context.find('.fx-autosubmit form, form.fx-autosubmit').each(function(){
        var form = $(this);
        var submitted = false;
        var submit = function(){
            if(submitted) return;
            submitted = true;
            form.submit();
        }
        form.on('change', ':checkbox, select', submit);
        form.on('fx-form-multiplechoice-change', submit);
    });

    context.find('.fx-form-hidden').removeClass('fx-form-hidden');
};

var checkbox = function(valueOrName, toggledContainerClass, additionalCallback) {
    var checkbox = $('input:checkbox[value="' + valueOrName + '"],input:checkbox[name="' + valueOrName + '"]');
    if (checkbox.size()) {
        var toggledContainerSelector = '.' + toggledContainerClass;

        var toggle = function() {
            if (checkbox.is(':checked')) {
                showFields(toggledContainerSelector);
            } else {
                hideFields(toggledContainerSelector);
            }
            if (additionalCallback)
                additionalCallback(checkbox.is(':checked'));
        };

        checkbox.click(toggle);
        toggle();
    }
};

var dropDown = function(name, toggledContainerClasses, toggledContainerClass) {
    singleChoiceField(name, toggledContainerClasses, toggledContainerClass, 'select', function(field) { return field.find('option'); }, function(option) { return option.is(':selected'); }, function(field, toggle) { field.change(toggle); });
}

var radio = function(name, toggledContainerClasses, toggledContainerClass) {
    singleChoiceField(name, toggledContainerClasses, toggledContainerClass, 'input:radio', function(field) { return field; }, function(option) { return option.is(':checked'); }, function(field, toggle) { field.click(toggle); });
};

var singleChoiceField = function(name, toggledContainerClasses, toggledContainerClass, selector, optionsCallback, selectedCallback, registerCallback) {
    var field = $(selector + '[name="' + name + '"]');
    var options = optionsCallback(field);
    if (field.size()) {
        var toggle = function() {
            var foundChecked = false;

            options.each(function() {
                var option = $(this);
                var value = option.val();
                if (toggledContainerClasses[value]) {
                    var toggledContainerSelector = '.' + toggledContainerClasses[value];
                    if (selectedCallback(option)) {
                        foundChecked = true;
                        showFields(toggledContainerSelector);
                    } else {
                        hideFields(toggledContainerSelector);
                    }
                }
            });

            if (toggledContainerClass) {
                var toggledContainerSelector = '.' + toggledContainerClass;

                if (foundChecked) {
                    showFields(toggledContainerSelector);
                } else {
                    hideFields(toggledContainerSelector);
                }
            }
        };

        registerCallback(field, toggle);
        toggle();
    }
};

var showFields = function(selector) {
    var toggledContainer = $(selector);
    if (toggledContainer.is(':hidden')) {
        toggledContainer.show();
        if (toggledContainer.data('removeHandler')) {
            toggledContainer.parents('form').unbind('submit', toggledContainer.data('removeHandler'));
            toggledContainer.data('removeHandler', null);
        }
    }
};

var hideFields = function(selector) {
    var toggledContainer = $(selector);
    if (toggledContainer.is(':visible')) {
        toggledContainer.hide();
        toggledContainer.data('removeHandler', function() {
            removeFieldsWhenSubmitting(selector);
        });
        toggledContainer.parents('form').bind('submit', toggledContainer.data('removeHandler'));
    }
};

var removeFieldsWhenSubmitting = function(selector) {
    $(selector).remove();
}

var toggleOptionalField = function(selector, toggledContainerClass) {
    var field = $('#' + selector);
    var toggle = function() {
        var action = field.is(':checked') ? 'required' : 'optional';
        $('.' + toggledContainerClass).each(function() {
            var optionalSpans = $(this).find('label > span.optional');
            if (action == 'required') {
                $(this).addClass('validator-required');
                optionalSpans.hide();
            } else {
                $(this).removeClass('validator-required');
                optionalSpans.show();
            }
        });
    };

    field.click(toggle);
    toggle();
};
