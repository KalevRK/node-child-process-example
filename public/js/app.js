/*
  Node Child Process Example project
  Kalev Roomann-Kurrik
  Last Modified: 7/18/2015
*/

// jQuery code to handle taking user-submitted values
// and send them in a GET request to the server to run the
// distributed algorithm and return the result

$(document).ready(function() {
  $('form').submit(function(e) {
    // Prevent default submit action for form
    e.preventDefault();

    // Capture values from form input elements
    var formData = {
      'numberElements': $('#numberElements').val(),
      'numberCores': $('#numberCores').val(),
      'useMaxCores': $('#useMaxCores').prop('checked'),
    };

    // Send an AJAX request to the server with the values from the form input elements
    // and when the server sends back a response set it in the #output div element
    $.ajax({
      type: 'POST',
      url: '/',
      data: formData,
      dataType: 'json',
      encode: true
    })
    .done(function(data) {
      $('#outputSum').text(data.sum);
      $('#outputTime').text(data.time + 'ms');
    });

  });
});
