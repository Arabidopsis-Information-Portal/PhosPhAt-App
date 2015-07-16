(function(window, $, undefined) {
  'use strict';
  var appContext = $('[data-app-name="phosphorylation-app"]');

  // Runs once Agave is ready
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    // Creates a table to display experimental data
    // Function is called once search button is clicked
    var showExperimentalData = function showExperimentalData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result;

      // Creates a base table that the data will be stored in
      $('#experimental-table', appContext).html(
        '<table class="table table-striped table-bordered .table-hover"' +
        'cellspacing="0" width="100%"><thead><tr><th>Peptide Sequence</th>' +
        '<th>Position</th><th>Modification Type</th><th>Mass</th>' +
        '</tr></thead><tbody id="experimental-data"></tbody></table>');

      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var peptideSeq = '<td>' + data[i].peptide_sequence + '</td>';
        var peptidePos = '<td>' + data[i].position_in_peptide + '</td>';
        var modType = '<td>' + data[i].modification_type + '</td>';
        var mass = '<td>' + data[i].mass + '</td>';

        // Dynamically adds saved data to the table
        $('#experimental-data', appContext).append('<tr>' + peptideSeq +
        peptidePos + modType  + mass + '</tr>');
      }

      // Converts normal table to DataTable
      $('table', appContext).DataTable({
        // Overrides default text to make it more specific to this App
        oLanguage: {
          sSearch: 'Narrow results:',
          sEmptyTable: 'No phosphorylation data available.'
        }
      });

    };

    // Runs function when users clicks the search button
    $('#searchButton').click(function() {

      // Empties out any tables from old searches
      $('#experimental-table', appContext).empty();

      // Saves user-input as a parameter
      var params = {
        transcript_id: $('input[name=transcript_input]').val()
      };

      // Calls PhosPhAt API to make experimental search, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'phosphorylated_experimental_v0.2',
         queryParams: params},
        showExperimentalData // Calls showExperimentalData() after click
      );
    });
  });
})(window, jQuery);
