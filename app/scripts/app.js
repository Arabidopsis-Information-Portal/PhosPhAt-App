/* All code should be in the following self-executing function.
    window represents the browser's window
    $ refers to jQuery
    undefined has no value set, making it truly undefined */
(function(window, $, undefined) {
  // Indicates that the code should be executed in strict mode, which is safer
  'use strict';
  // Added to selectors to make sure the app doesn't interfere with other apps
  var appContext = $('[data-app-name="phosphorylation-app"]');

  /* Having all of the code in this event listener ensures that Agave is
     ready before the rest of the code is executed. This is important
     because Agave is what's used to call the web services. */
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;
    var transcriptID;

    // Will be used to store initialized DataTables
    var experimentalTable,
        predictedTable,
        expHotspotTable,
        predHotspotTable;

    // Once the search form is submitted, retrieve the data
    $('#searchForm', appContext).submit(function(event) {
      // Reset UI elements.
      $('#proteinInfoBox', appContext).hide();
      $('#errorBox', appContext).empty();

      // Insert loading text, will be replaced by table
      $('#experimentalTab', appContext).html('<h2>Loading...</h2>');
      $('#predictedTab', appContext).html('<h2>Loading...</h2>');
      $('#predictedHotspotsTab', appContext).html('<h2>Loading...</h2>');

      // Save user-input as a parameter
      transcriptID = $('input[name=transcriptInput]', appContext).val();
      var params = {
        transcript_id: transcriptID
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

      // Call API to retrieve experimental hotspot data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'experimental_hotspots_v0.1',
         queryParams: params},
        showExpHotspotData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception.
      );

      // Call API to retrieve predicted hotspot data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'predicted_hotspots_v0.3',
         queryParams: params},
        showPredHotspotData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception.
      );

      // Prevent page from reloading when form is submitted
      event.preventDefault();
    }); // $('#searchForm').submit


    // Clear the screen when the clear button is clicked.
    $('#clearButton', appContext).click(function() {
      // Clear input field
      $('input[name=transcriptInput]', appContext).val('');

      // Remove protein sequence
      $('#proteinSequenceBox', appContext).empty();
      $('#proteinInfoBox', appContext).hide();

      // Remove any errors present
      $('#errorBox', appContext).empty();

      // Reset number of rows
      $('#numExperimentalEntries', appContext).empty();
      $('#numPredictedEntries', appContext).empty();
      $('#numExpHotspotsEntries', appContext).empty();
      $('#numPredHotspotsEntries', appContext).empty();

      // Remove tables
      $('#experimentalTab', appContext).html('<h2>Please search for a transcript ID.</h2>');
      $('#predictedTab', appContext).html('<h2>Please search for a transcript ID.</h2>');
      $('#experimentalHotspotsTab', appContext).html('<h2>Please search for a transcript ID.</h2>');
      $('#predictedHotspotsTab', appContext).html('<h2>Please search for a transcript ID.</h2>');

      // select the about tab
      $('a[href="#aboutTab"]', appContext).tab('show');
    });


    // Create a table to display experimental data
    var showExperimentalData = function showExperimentalData(response) {
      // Store API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Display protein sequence in FASTA
      if (data.length > 0) {
        var formatted_seq = '';
        var raw_seq = data[0].protein_sequence;
        // Add a new line every 70 characters
        while (raw_seq.length > 0) {
          formatted_seq += raw_seq.substring(0, 70) + '<br />';
          raw_seq = raw_seq.substring(70);
        }
        $('#proteinSequenceBox', appContext).html('>' +
          transcriptID  + '<br />');
        $('#proteinSequenceBox', appContext).append(formatted_seq);
        $('#proteinInfoBox', appContext).show();
      }

      // Create a base table that the data will be stored in
      $('#experimentalTab', appContext).html(
        '<table width="100%" cellspacing="0" id="experimentalTable"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Peptide Sequence</th><th>Position in Sequence</th>' +
        '<th>Modification Type</th><th>Mass</th></tr></thead>' +
        '<tbody id="experimentalData"></tbody></table>');

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
        $('#experimentalData', appContext).append('<tr>' + peptideSeq +
        peptidePos + modType  + peptideMass + '</tr>');
      }

      // Convert normal table to a DataTable
      experimentalTable = $('#experimentalTable', appContext).DataTable({
        oLanguage: { // Override default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No experimental phosphorylation data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allow for user to reorder columns
        stateSave: true, // Save the state of the table between loads
        colReorder: true
      });

      // Add the number of rows to the tab name
      $('#numExperimentalEntries', appContext).html(' (' + experimentalTable.data().length + ')');

    }; // showExperimentalData


    // Create a table to display predicted data
    var showPredictedData = function showPredictedData(response) {
      // StoresAPI response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Create a base table that the data will be stored in
      $('#predictedTab', appContext).html(
        '<table id="predictedTable" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Protein Position</th><th>13-mer Sequence</th>' +
        '<th>Prediction Score</th></tr></thead>' +
        '<tbody id="predictedData"></tbody></table>');

      // Temporarily save each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Save data in strings to later be added to table
        var proteinPos = '<td>' + data[i].position_in_protein + '</td>';
        var sequence = '<td>' + data[i].thirteen_mer_sequence + '</td>';
        // Round prediction score
        var predictionScore = '<td>' + parseFloat(data[i].prediction_score).toFixed(4) + '</td>';
        // Dynamically add saved data to the table
        $('#predictedData', appContext).append('<tr>' + proteinPos +
        sequence + predictionScore + '</tr>');
      }

      // Convert normal table to DataTable
        predictedTable = $('#predictedTable', appContext).DataTable({
        oLanguage: { // Override default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No predicted phosphorylation data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allow for user to reorder columns
        stateSave: true, // Save the state of the table between loads
        colReorder: true
      });

      // Add the number of rows to the tab name
      $('#numPredictedEntries', appContext).html(' (' + predictedTable.data().length + ')');

    }; // showPredictedData


    // Create a table to display experimental hotspot data
    var showExpHotspotData = function showExpHotspotData(response) {
      // Store API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Create a base table that the data will be stored in
      $('#experimentalHotspotsTab', appContext).html(
        '<table id="expHotspotTable" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Start Position</th><th>End Position</th>' +
        '<th>Hotspot Sequence</th></tr></thead>' +
        '<tbody id="experimentalHotspotData"></tbody></table>');

      // Temporarily save each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var start = '<td>' + data[i].start_position + '</td>';
        var end = '<td>' + data[i].end_position + '</td>';
        var sequence = '<td>' + data[i].hotspot_sequence + '</td>';

        // Dynamically add saved data to the table
        $('#experimentalHotspotData', appContext).append('<tr>' + start +
        end + sequence + '</tr>');
      }

      // Convert normal table to DataTable
      expHotspotTable = $('#expHotspotTable', appContext).DataTable({
        oLanguage: { // Override default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No hotspot data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allow for user to reorder columns
        stateSave: true, // Save the state of the table between loads
        colReorder: true
      });

      // Add the number of rows to the tab name
      $('#numExpHotspotsEntries', appContext).html(' (' + expHotspotTable.data().length + ')');

    }; // showHotspotData


    // Create a table to display predicted hotspot data
    var showPredHotspotData = function showPredHotspotData(response) {
      // Store API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Create a base table that the data will be stored in
      $('#predictedHotspotsTab', appContext).html(
        '<table id="predHotspotTable" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Start Position</th><th>End Position</th>' +
        '<th>Hotspot Sequence</th></tr></thead>' +
        '<tbody id="predictedHotspotData"></tbody></table>');

      // Temporarily save each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var start = '<td>' + data[i].start_position + '</td>';
        var end = '<td>' + data[i].end_position + '</td>';
        var sequence = '<td>' + data[i].hotspot_sequence + '</td>';

        // Dynamically add saved data to the table
        $('#predictedHotspotData', appContext).append('<tr>' + start +
        end + sequence + '</tr>');
      }

      // Convert normal table to DataTable
      predHotspotTable = $('#predHotspotTable', appContext).DataTable({
        oLanguage: { // Override default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No hotspot data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allow for user to reorder columns
        stateSave: true, // Save the state of the table between loads
        colReorder: true
      });

      // Add the number of rows to the tab name
      $('#numPredHotspotsEntries', appContext).html(' (' + predHotspotTable.data().length + ')');

    }; // showPredHotspotData

    // If the API returns an error, display the error message
    var showErrorMessage = function showErrorMessage(response) {
      $('#errorBox', appContext).html(
          '<h4>There was an error retrieving your data from the server. ' +
          'See below:</h4><div class="alert alert-danger" role="alert">' +
           response.obj.message + '</div>');
    };

  });
})(window, jQuery);
