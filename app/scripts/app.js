(function(window, $, undefined) {
  'use strict';
  var appContext = $('[data-app-name="phosphorylation-app"]');

  // Only runs once Agave is ready
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    // Once the search button is clicked, retrieve the data
    $('#phosphat_searchButton').click(function() {

      // Inserts loading text, will be replaced by table
      $('#phosphat_experimental', appContext).html('<h2>Loading...</h2>');
      $('#phosphat_predicted', appContext).html('<h2>Loading...</h2>');
      $('#phosphat_hotspots', appContext).html('<h2>Loading...</h2>');

      // Saves user-input as a parameter
      var params = {
        transcript_id: $('input[name=transcript_input]').val()
      };

      // TODO: Add error methods

      // Calls API to retrieve experimental data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'phosphorylated_experimental_v0.2',
         queryParams: params},
        showExperimentalData // Displays retrieved data in a table
      );

      // Calls API to retrieve predicted data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'iliban-dev', service: 'phosphorylated_predicted_v0.1',
         queryParams: params},
        showPredictedData // Displays retrieved data in a table
      );

      // Calls API to retrieve hotspot data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'iliban-dev', service: 'phosphorylated_hotspots_v0.1',
         queryParams: params},
        showHotspotData // Displays retrieved data in a table
      );
    });


    // Creates a table to display experimental data
    var showExperimentalData = function showExperimentalData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result;

      // Creates a base table that the data will be stored in
      $('#phosphat_experimental', appContext).html(
        '<table width="100%" cellspacing="0" id="phosphat_experimental-table"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Peptide Sequence</th><th>Position</th>' +
        '<th>Modification Type</th><th>Mass</th></tr></thead>' +
        '<tbody id="phosphat_experimental-data"></tbody></table>');

      // Loops through each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var peptideSeq = '<td>' + data[i].peptide_sequence + '</td>';
        var peptidePos = '<td>' + data[i].position_in_peptide + '</td>';
        var modType = '<td>' + data[i].modification_type + '</td>';
        // TODO: Have API return null instead of empty quotes
        // Checks to see if mass was provided, if so round it.
        if (data[i].mass !== "") {
          var mass = '<td>' + parseFloat(data[i].mass).toFixed(3) + '</td>';
        } else {
          var mass = '<td>' + 'not provided' + '</td>';
        }

        // Dynamically adds saved data to the table
        $('#phosphat_experimental-data', appContext).append('<tr>' + peptideSeq +
        peptidePos + modType  + mass + '</tr>');
      }

      // Converts normal table to DataTable
      $('#phosphat_experimental-table', appContext).DataTable({
        // Overrides default text to make it more specific to this app
        oLanguage: {
          sSearch: 'Narrow results:',
          sEmptyTable: 'No phosphorylation data available.'
        }
      });

    };

    // Creates a table to display predicted data
    var showPredictedData = function showPredictedData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result;

      // Creates a base table that the data will be stored in
      $('#phosphat_predicted', appContext).html(
        '<table id="phosphat_predicted-table" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Protein Position</th><th>13-mer Sequence</th>' +
        '<th>Prediction Score</th></tr></thead>' +
        '<tbody id="phosphat_predicted-data"></tbody></table>');

      // Loops through each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var proteinPos = '<td>' + data[i].position_in_protein + '</td>';
        // TODO: Modify API to rename 13mer_sequence to thirteen_mer_sequence
        var sequence = '<td>' + data[i].thirteen_mer_sequence + '</td>';
        // Rounds number
        var predictionScore = '<td>' + parseFloat(data[i].prediction_score).toFixed(4) + '</td>';

        // Dynamically adds saved data to the table
        $('#phosphat_predicted-data', appContext).append('<tr>' + proteinPos +
        sequence + predictionScore + '</tr>');
      }

      // Converts normal table to DataTable
      $('#phosphat_predicted-table', appContext).DataTable({
        // Overrides default text to make it more specific to this app
        oLanguage: {
          sSearch: 'Narrow results:',
          sEmptyTable: 'No phosphorylation data available.'
        }
      });
    };

    // Creates a table to display hotspot data
    var showHotspotData = function showHotspotData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result;

      // Creates a base table that the data will be stored in
      $('#phosphat_hotspots', appContext).html(
        '<table id="phosphat_hotspot-table" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Start Position</th><th>End Position</th>' +
        '<th>Hotspot Sequence</th></tr></thead>' +
        '<tbody id="phosphat_hotspot-data"></tbody></table>');

      // Loops through each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var start = '<td>' + data[i].start_position + '</td>';
        var end = '<td>' + data[i].end_position + '</td>';
        var sequence = '<td>' + data[i].hotspot_sequence + '</td>';


        // Dynamically adds saved data to the table
        $('#phosphat_hotspot-data', appContext).append('<tr>' + start +
        end + sequence + '</tr>');
      }

      // Converts normal table to DataTable
      $('#phosphat_hotspot-table', appContext).DataTable({
        // Overrides default text to make it more specific to this app
        oLanguage: {
          sSearch: 'Narrow results:',
          sEmptyTable: 'No phosphorylation data available.'
        }
      });

    };
  });
})(window, jQuery);
