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
      $('#experimental', appContext).html(
        '<table width="100%" cellspacing="0" id="experimental-table"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Peptide Sequence</th><th>Position</th>' +
        '<th>Modification Type</th><th>Mass</th></tr></thead>' +
        '<tbody id="experimental-data"></tbody></table>');

      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var peptideSeq = '<td>' + data[i].peptide_sequence + '</td>';
        var peptidePos = '<td>' + data[i].position_in_peptide + '</td>';
        var modType = '<td>' + data[i].modification_type + '</td>';
        // TODO: Have API return null instead of empty quotes
        if (data[i].mass !== "") {
          var mass = '<td>' + parseFloat(data[i].mass).toFixed(3) + '</td>';
        } else {
          var mass = '<td>' + 'not provided' + '</td>';
        }

        // Dynamically adds saved data to the table
        $('#experimental-data', appContext).append('<tr>' + peptideSeq +
        peptidePos + modType  + mass + '</tr>');
      }

      // Converts normal table to DataTable
      $('#experimental-table', appContext).DataTable({
        // Overrides default text to make it more specific to this App
        oLanguage: {
          sSearch: 'Narrow results:',
          sEmptyTable: 'No phosphorylation data available.'
        }
      });

    };

    // Creates a table to display predicted data
    // Function is called once search button is clicked
    var showPredictedData = function showPredictedData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result;

      // Creates a base table that the data will be stored in
      $('#predicted', appContext).html(
        '<table id="predicted-table" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Protein Position</th><th>13-mer Sequence</th>' +
        '<th>Prediction Score</th></tr></thead>' +
        '<tbody id="predicted-data"></tbody></table>');

      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var proteinPos = '<td>' + data[i].position_in_protein + '</td>';
        // TODO: Modify API to rename 13mer_sequence to thirteen_mer_sequence
        var sequence = '<td>' + data[i].thirteen_mer_sequence + '</td>';
        var predictionScore = '<td>' + parseFloat(data[i].prediction_score).toFixed(4) + '</td>';


        // Dynamically adds saved data to the table
        $('#predicted-data', appContext).append('<tr>' + proteinPos +
        sequence + predictionScore + '</tr>');
      }

      // Converts normal table to DataTable
      $('#predicted-table', appContext).DataTable({
        // Overrides default text to make it more specific to this App
        oLanguage: {
          sSearch: 'Narrow results:',
          sEmptyTable: 'No phosphorylation data available.'
        }
      });
    };

    // Creates a table to display hotspot data
    // Function is called once search button is clicked
    var showHotspotData = function showHotspotData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result;

      // Creates a base table that the data will be stored in
      $('#hotspots', appContext).html(
        '<table id="hotspot-table" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Start Position</th><th>End Position</th>' +
        '<th>Hotspot Sequence</th></tr></thead>' +
        '<tbody id="hotspot-data"></tbody></table>');

      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var start = '<td>' + data[i].start_position + '</td>';
        var end = '<td>' + data[i].end_position + '</td>';
        var sequence = '<td>' + data[i].hotspot_sequence + '</td>';


        // Dynamically adds saved data to the table
        $('#hotspot-data', appContext).append('<tr>' + start +
        end + sequence + '</tr>');
      }

      // Converts normal table to DataTable
      $('#hotspot-table', appContext).DataTable({
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
      //$('#experimental-table', appContext).empty();
      //$('#predicted-table', appContext).empty();

      // Inserts laoding text, will be replaced by table
      $('#experimental', appContext).html('<h2>Loading...</h2>');
      $('#predicted', appContext).html('<h2>Loading...</h2>');
      $('#hotspots', appContext).html('<h2>Loading...</h2>');

      // Saves user-input as a parameter
      var params = {
        transcript_id: $('input[name=transcript_input]').val()
      };

      // TODO: Add error methods

      // Calls PhosPhAt API to make experimental search, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'phosphorylated_experimental_v0.2',
         queryParams: params},
        showExperimentalData // Calls showExperimentalData() after click
      );

      // Calls PhosPhAt API to make predicted search, using saved parameter
      Agave.api.adama.search(
        {namespace: 'iliban-dev', service: 'phosphorylated_predicted_v0.1',
         queryParams: params},
        showPredictedData // Calls showPredictedData() after click
      );

      // Calls PhosPhAt API to make hotspot search, using saved parameter
      Agave.api.adama.search(
        {namespace: 'iliban-dev', service: 'phosphorylated_hotspots_v0.1',
         queryParams: params},
        showHotspotData // Calls showPredictedData() after click
      );


    });
  });
})(window, jQuery);
