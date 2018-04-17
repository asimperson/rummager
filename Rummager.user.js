// ==UserScript==
// @name        Rummager
// @namespace   https://robotpistol.github.io/rummager
// @include     https://bevager.com/brg/home?rewardsGroupName=rumbustion
// @version     1
// @grant       none
// ==/UserScript==

function matchesFilter(filterTextArray, value) {
    return filterTextArray.reduce((isMatched, filter) => {
	if (!isMatched) { return false; }
	return filter.startsWith('^') ? !value.includes(filter.substr(1)) : value.includes(filter);
    }, true);
}

function clearFilters() {
    $('#itemFilter').val('');
    $('#notesFilter').val('');
    $('#countryFilter').val('');
    $('#priceFilter').val('');
    $('#itemFilter').keyup();
}

function generateFilterArray(element) {
    return element.val().toLowerCase().trim().split(' ');
}

function handleFilter() {
    $('.item').hide();

    const onlyAvailable = $('#showAvailableOnly').is(':checked');
    const onlyUnsigned = $('#showUnsignedOnly').is(':checked');
    let $rows = (onlyAvailable) ? $('.item:not(.historic-item)') : $('.item');

    if (onlyUnsigned) {
	$rows = $rows.filter((i, e) => $(e).find('.request-status').text().trim() === 'REQ');
    }

    const itemFilterTextArray = generateFilterArray($('#itemFilter'));
    const notesFilterTextArray = generateFilterArray($('#notesFilter'));
    const countryFilterTextArray = generateFilterArray($('#countryFilter'));
    const priceFilter = $('#priceFilter').val();

    $rows.each((index, row) => {
	const $row = $(row);
	const item = {
	    name: $row.find('.item-name').text().toLowerCase(),
	    notes: $row.find('.notes').text().toLowerCase(),
	    price: Number($($row.children()[2]).text().replace(/[^0-9.]+/g, '')),
	    country: $($row.children()[0]).text().toLowerCase(),
	};
	const rowMatched =
	      matchesFilter(itemFilterTextArray, item.name) &&
	      matchesFilter(notesFilterTextArray, item.notes) &&
	      matchesFilter(countryFilterTextArray, item.country) &&
	      (priceFilter === '' || item.price <= priceFilter);

	if (rowMatched) {
	    $row.show();
	} else {
	    $row.hide();
	}
    });

    $('#count').html($('.item:visible').length);
}

function overlayRummager() {
    if ($('#notesFilter').length !== 0 || $('#itemFilter').length === 0) {
	return;
    }
    $('#itemFilter').attr({ placeholder: 'Search Name' });
    $('<input type="number" class="form-control" id="priceFilter" placeholder="Upper Price Limit">')
        .insertAfter($('#itemFilter'));
    $('<input type="text" class="form-control" id="notesFilter" placeholder="Search Notes">')
        .insertAfter($('#itemFilter'));
    $('<input type="text" class="form-control" id="countryFilter" placeholder="Search Country">')
        .insertAfter($('#itemFilter'));
    $('<input type="checkbox" id="showUnsignedOnly">Hide Signed & Requested<br/>')
        .insertAfter($('.item-locator'));
    $('<br/><button class="btn btn-primary" id="clearFilters">Clear Filters</button>')
        .insertBefore($('table'));

    $('#clearFilters').click(clearFilters);
    $('#showUnsignedOnly').change(handleFilter);
    $('#notesFilter').keyup(handleFilter);
    $('#countryFilter').keyup(handleFilter);
    $('#priceFilter').keyup(handleFilter);
    $('#itemFilter').keyup(handleFilter);
}

overlayRummager();
