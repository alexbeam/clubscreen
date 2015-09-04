
// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    $("option:selected").change(function() {
        console.log("changed!");
        var involvement = $('select#involvement option:selected').val()
        var position_type = $("select#position_type option:selected").val()
        var club_type = $("select#club_type option:selected").val()
    
        populateTable(involvement, position_type, club_type)
    });
});

// Functions =============================================================

// Fill table with data
function populateTable(involvement, position_type, club_type) {

    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/postinglist/filter/'+involvement+'/'+position_type+'/'+club_type, function( data ) {
        console.log(data);
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><h5>' + this._id + '</h5></td>';
            tableContent += "<td><h4><a href='/posting/" + this._id + "' style='color: #00274c; text-decoration: underline;' >" this.title + '</a>' + this.club + '<br>Applicants Received: ' + this.received + '</td>';
            tableContent += '<td>'+ this.created '<br>' + this.expires + '</td>';
            tableContent += "<td><button onclick='window.location.href='/posting/"+ this._id "'' class='btn btn-block btn-primary' style='background-color: #00274c; color: #ffcb05;'>Apply</button></td>";
            tableContent += '</tr>';
        });


        // Inject the whole content string into our existing HTML table
        $('table tbody').html(tableContent);
    });
};