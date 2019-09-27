function filterTestsForBrowser() {
    var testTables = document.getElementsByTagName("table");
    for (var i = 0; i < testTables.length; i++)
    {
        filterTestTableForBrowser(testTables[i]);
    }
}

function filterTestTableForBrowser(testTable)
{
    for(rowNum = testTable.rows.length - 1; rowNum >= 0; rowNum--)
    {
        var row = testTable.rows[rowNum];
        var filterString = row.getAttribute("if");
        if (filterString && !eval(filterString))
        {
          testTable.deleteRow(rowNum)
        }
    }
}

window.onload=filterTestsForBrowser;