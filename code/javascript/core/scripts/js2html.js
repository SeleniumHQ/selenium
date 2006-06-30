/*

This is an experiment in using the Narcissus JavaScript engine 
to allow Selenium scripts to be written in plain JavaScript.

The 'jsparse' function will compile each high level block into a Selenium table script.


TODO: 
1) Test! (More browsers, more sample scripts)
2) Stepping and walking lower levels of the parse tree
3) Calling Selenium commands directly from JavaScript
4) Do we want comments to appear in the TestRunner?
5) Fix context so variables don't have to be global
   For now, variables defined with "var" won't be found
   if used later on in a script.
6) Fix formatting   
*/


function jsparse() {
    var script = document.getElementById('sejs')
    var fname = 'javascript script';
    parse_result = parse(script.text, fname, 0);       

    var x2 = new ExecutionContext(GLOBAL_CODE);
    ExecutionContext.current = x2;


    var new_test_source = '';    
    var new_line        = '';
    
    for (i=0;i<parse_result.$length;i++){ 
        var the_start = parse_result[i].start;
        var the_end;
        if ( i == (parse_result.$length-1)) {
            the_end = parse_result.tokenizer.source.length;
        } else {
            the_end = parse_result[i+1].start;
        }
        
        var script_fragment = parse_result.tokenizer.source.slice(the_start,the_end)
        
        new_line = '<tr><td style="display:none;" class="js">getEval</td>' +
                   '<td style="display:none;">currentTest.doNextCommand()</td>' +
                   '<td style="white-space: pre;">' + script_fragment + '</td>' + 
                   '<td></td></tr>\n';
        new_test_source += new_line;
        //eval(script_fragment);
        
              
    };
    
    
    
    execute(parse_result,x2)

    // Create HTML Table        
    body = document.body      
    body.innerHTML += "<table class='selenium' id='se-js-table'>"+
                      "<tbody>" +
                      "<tr><td>// " + document.title + "</td></tr>" +
                      new_test_source +
                      "</tbody" +
                      "</table>";          
   
    //body.innerHTML = "<pre>" + parse_result + "</pre>"
}


