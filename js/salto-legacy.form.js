$(function() {
	
	$('form').each(function() {
		var form = $(this);
		
		form.find('.fieldtype-MultipleCheckboxField .field').each(function() {
			var field = $(this);
			var checkboxes = field.find('.multipleCheckbox').hide();
			
			var createComponentDiv = field.append('<div class="create-component reference"></div>').children(':last');
			
			var label = form.is('.search-form') ? 'No filter' : 'Please choose';
			
			var selectHtml = '<select><option value="">- ' + label + ' -</option>';
			checkboxes.each(function() {
				var checkbox = $(this).find('input');
				var label = $(this).find('label');
				selectHtml += '<option value="' + checkbox.attr('id') + '">' + label.text() + '</option>'; 
			});
			selectHtml += '</select>';
			var select = createComponentDiv.append(selectHtml).children(':last');
			
			var addButton = createComponentDiv.append('<span class="button round-button small-button button-create-component">Add</span>').children(':last');
			addButton.click(function() {
				var checkboxValue = select.val();
				if (!checkboxValue) return;

				var option = select.find('option[value="' + checkboxValue + '"]');
				var optionBefore = option.prev();
				var optionClone = option.clone();
				option.remove();
				
				var checkbox = checkboxes.find('#' + checkboxValue);
				checkbox.attr('checked', 'checked');
				
				var selectedInformation = createComponentDiv.before('<div class="component"><div class="component-read-only">' + option.text() + ' </div><span class="button-delete-component button-icon smallprint">Remove</span></div>').prev();
				var deleteButton = selectedInformation.find('.button-delete-component');
				
				deleteButton.click(function() {
					checkbox.removeAttr('checked');
					optionBefore.after(optionClone);
					selectedInformation.remove();
				});
				
			});
			
			checkboxes.find('input[checked]').each(function() {
				var checkbox = $(this);
				select.val(checkbox.attr('id'));
				addButton.click();
			});
			
			form.submit(function() {
				addButton.click();
			});
		});
		$('.fx-form-hidden').show();

        if (typeof $.datepicker !== 'undefined') {
            form.find('.fx-datepicker').datepicker({
                dateFormat: 'dd.mm.yy',
                yearRange: 'c-100:c+10',
                firstDay: 1,
                showAnim: 'slideDown',
                changeMonth: true,
                changeYear: true
            });
        }

	});
	
	$('.form-with-component-fields').each(function() {
		var form = $(this);
		var roundTripButton = form.find('.action-round_trip').hide();
		
		form.find('.checkbox-delete-component').each(function() {
			var checkbox = $(this).hide();
			var label = form.find('label[for="' + checkbox.attr('id') + '"]').hide();
			var deleteButton = checkbox.after('<span class="button-delete-component button-icon smallprint">' + label.text() + '</span>').next();
			deleteButton.click(function() {
				checkbox.click();
				roundTripButton.click();
			});
		});
		
		form.find('.create-component:not(.reference)').each(function() {
			var createComponentDiv = $(this);
			var addAnotherButton = createComponentDiv.append('<span class="button round-button small-button button-create-component">Add</span>').children(':last');
			addAnotherButton.click(function() {
				roundTripButton.click();
			});
		});
	});
});