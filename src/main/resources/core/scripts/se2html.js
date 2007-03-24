/*

This is an experiment in creating a "selenese" parser that drastically
cuts down on the line noise associated with writing tests in HTML.

The 'parse' function will accept the follow sample commands.

test-cases:
    //comment
    command "param"
    command "param" // comment
    command "param" "param2"
    command "param" "param2" // this is a comment

TODO: 
1) Deal with multiline parameters
2) Escape quotes properly
3) Determine whether this should/will become the "preferred" syntax 
   for delivered Selenium self-test scripts
*/    


function separse(doc) {
    // Get object
    script = doc.getElementById('testcase')
    // Split into lines
    lines = script.text.split('\n');


    var command_pattern = / *(\w+) *"([^"]*)" *(?:"([^"]*)"){0,1}(?: *(\/\/ *.+))*/i;
    var comment_pattern = /^ *(\/\/ *.+)/

    // Regex each line into selenium command and convert into table row.
    // eg. "<command> <quote> <quote> <comment>"
    var new_test_source = '';
    var new_line        = '';
    for (var x=0; x < lines.length; x++) {
        result = lines[x].match(command_pattern);
        if (result != null) {
            new_line = "<tr><td>" + (result[1] || '&nbsp;') + "</td>" +
                           "<td>" + (result[2] || '&nbsp;') + "</td>" +
                           "<td>" + (result[3] || '&nbsp;') + "</td>" +
                           "<td>" + (result[4] || '&nbsp;') + "</td></tr>\n";
            new_test_source += new_line;
        }
        result = lines[x].match(comment_pattern);
        if (result != null) {
            new_line = '<tr><td rowspan="1" colspan="4">' +
                       (result[1] || '&nbsp;') +
                       '</td></tr>';
            new_test_source += new_line;
        }
    }

    // Create HTML Table        
    body = doc.body
    body.innerHTML += "<table class='selenium' id='testtable'>"+
                      new_test_source +
                      "</table>";

}


