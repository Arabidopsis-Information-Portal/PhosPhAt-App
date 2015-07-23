(function(window, $, undefined) {
  'use strict';
  var appContext = $('[data-app-name="phosphorylation-app"]');

  // Ensure Agave is ready before running
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    // Will be used to store initialized DataTables
    var experimentalTable,
        predictedTable,
        hotspotTable;


    // Once the search form is submitted, retrieve the data
    $('#phosphat_search').submit(function(event) {
      // Reset UI elements.
      $('#phosphat_protein-seq-cont', appContext).hide();
      $('#phosphat_error', appContext).empty();

      // Insert loading text, will be replaced by table
      $('#phosphat_experimental', appContext).html('<h2>Loading...</h2>');
      $('#phosphat_predicted', appContext).html('<h2>Loading...</h2>');
      $('#phosphat_hotspots', appContext).html('<h2>Loading...</h2>');

      // Save user-input as a parameter
      var params = {
        transcript_id: $('input[name=phosphat_transcript-input]').val()
      };

      // Call API to retrieve experimental data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'phosphorylated_experimental_v0.2',
         queryParams: params},
        showExperimentalData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception
      );

      // Call API to retrieve predicted data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'phosphorylated_predicted_v0.2',
         queryParams: params},
        showPredictedData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception
      );

      // Call API to retrieve hotspot data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'phosphorylated_hotspots_v0.2',
         queryParams: params},
        showHotspotData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception.
      );

      // Prevent page from reloading when form is submitted
      event.preventDefault();
    }); // $('#phosphat_search').submit


    // Clear the screen when the clear button is clicked.
    $('#phosphat_clearButton').click(function() {
      // Clear input field
      $('input[name=phosphat_transcript-input]').val('');

      // Remove protein sequence
      $('#phosphat_protein-seq', appContext).empty();
      $('#phosphat_protein-seq-cont', appContext).hide();

      // Remove any errors present
      $('#phosphat_error', appContext).empty();

      // Reset number of rows
      $('#exp_num_rows', appContext).empty();
      $('#pred_num_rows', appContext).empty();
      $('#hot_num_rows', appContext).empty();

      // Remove tables
      $('#phosphat_experimental').html('<h2>Please search for a transcript ID.</h2>');
      $('#phosphat_predicted').html('<h2>Please search for a transcript ID.</h2>');
      $('#phosphat_hotspots').html('<h2>Please search for a transcript ID.</h2>');
    });


    // Create a table to display experimental data
    var showExperimentalData = function showExperimentalData(response) {
      // Store API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Display protein sequence
      if (data.length > 0) {
        $('#phosphat_protein-seq', appContext).html(data[0].protein_sequence);
        $('#phosphat_protein-seq-cont', appContext).show();
      }

      // Create a base table that the data will be stored in
      $('#phosphat_experimental', appContext).html(
        '<table width="100%" cellspacing="0" id="phosphat_experimental-table"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Peptide Sequence</th><th>Position</th>' +
        '<th>Modification Type</th><th>Mass</th></tr></thead>' +
        '<tbody id="phosphat_experimental-data"></tbody></table>');

      // Temporarily save each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var peptideSeq = '<td>' + data[i].peptide_sequence + '</td>';
        var peptidePos = '<td>' + data[i].position_in_peptide + '</td>';
        var modType = '<td>' + data[i].modification_type + '</td>';
        // Checks to see if a mass was provided, if so round it.
        var peptideMass;
        if (data[i].mass !== '') {
          peptideMass = '<td>' + parseFloat(data[i].mass).toFixed(3) + '</td>';
        } else {
          peptideMass = '<td>' + 'not provided' + '</td>';
        }

        // Dynamically add saved data to the table
        $('#phosphat_experimental-data', appContext).append('<tr>' + peptideSeq +
        peptidePos + modType  + peptideMass + '</tr>');
      }

      // Convert normal table to a DataTable
      experimentalTable = $('#phosphat_experimental-table', appContext).DataTable({
        oLanguage: { // Override default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No experimental phosphorylation data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allow for user to reorder columns
        stateSave: true // Save the state of the table between loads
      });

      // Add the number of rows to the tab name
      $('#exp_num_rows', appContext).html(' (' + experimentalTable.data().length + ')');

    }; // showExperimentalData


    // Create a table to display predicted data
    var showPredictedData = function showPredictedData(response) {
      // StoresAPI response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Create a base table that the data will be stored in
      $('#phosphat_predicted', appContext).html(
        '<table id="phosphat_predicted-table" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Protein Position</th><th>13-mer Sequence</th>' +
        '<th>Prediction Score</th></tr></thead>' +
        '<tbody id="phosphat_predicted-data"></tbody></table>');

      // Temporarily save each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Save data in strings to later be added to table
        var proteinPos = '<td>' + data[i].position_in_protein + '</td>';
        var sequence = '<td>' + data[i].thirteen_mer_sequence + '</td>';
        // Round prediction score
        var predictionScore = '<td>' + parseFloat(data[i].prediction_score).toFixed(4) + '</td>';
        // Dynamically add saved data to the table
        $('#phosphat_predicted-data', appContext).append('<tr>' + proteinPos +
        sequence + predictionScore + '</tr>');
      }

      // Convert normal table to DataTable
        predictedTable = $('#phosphat_predicted-table', appContext).DataTable({
        oLanguage: { // Override default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No predicted phosphorylation data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allow for user to reorder columns
        stateSave: true // Save the state of the table between loads
      });

      // Add the number of rows to the tab name
      $('#pred_num_rows', appContext).html(' (' + predictedTable.data().length + ')');

    }; // showPredictedData

    // Create a table to display hotspot data
    var showHotspotData = function showHotspotData(response) {

      // Store API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Create a base table that the data will be stored in
      $('#phosphat_hotspots', appContext).html(
        '<table id="phosphat_hotspot-table" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Start Position</th><th>End Position</th>' +
        '<th>Hotspot Sequence</th></tr></thead>' +
        '<tbody id="phosphat_hotspot-data"></tbody></table>');

      // Temporarily save each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var start = '<td>' + data[i].start_position + '</td>';
        var end = '<td>' + data[i].end_position + '</td>';
        var sequence = '<td>' + data[i].hotspot_sequence + '</td>';

        // Dynamically add saved data to the table
        $('#phosphat_hotspot-data', appContext).append('<tr>' + start +
        end + sequence + '</tr>');
      }

      // Convert normal table to DataTable
      hotspotTable = $('#phosphat_hotspot-table', appContext).DataTable({
        oLanguage: { // Override default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No hotspot data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allow for user to reorder columns
        stateSave: true // Save the state of the table between loads
      });

      // Add the number of rows to the tab name
      $('#hot_num_rows', appContext).html(' (' + hotspotTable.data().length + ')');

    }; // showHotspotData

    // If the API returns an error, display the error message
    var showErrorMessage = function showErrorMessage(response) {
      $('#phosphat_error', appContext).html(
          '<h4>There was an error retrieving your data from the server. ' +
          'See below:</h4><div class="alert alert-danger" role="alert">' +
           response.obj.message + '</div>');
    };

  });
})(window, jQuery);
