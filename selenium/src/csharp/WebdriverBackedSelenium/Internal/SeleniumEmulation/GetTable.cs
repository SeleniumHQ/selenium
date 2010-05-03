using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    class GetTable : SeleneseCommand
    {
        private static readonly Regex TableParts = new Regex("(.*)\\.(\\d+)\\.(\\d+)");
        private ElementFinder finder;
        private JavaScriptLibrary library;

        public GetTable(ElementFinder elementFinder, JavaScriptLibrary js)
        {
            this.finder = elementFinder;
            this.library = js;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string tableString = string.Empty;

            if (!TableParts.IsMatch(locator))
            {
                throw new SeleniumException("Invalid target format. Correct format is tableName.rowNum.columnNum");
            }

            Match tableMatch = TableParts.Match(locator);
            string tableName = tableMatch.Groups[0].Value;
            long row = int.Parse(tableMatch.Groups[1].Value);
            long col = int.Parse(tableMatch.Groups[2].Value);

            IWebElement table = finder.FindElement(driver, tableName);

            string script =
                "var table = arguments[0]; var row = arguments[1]; var col = arguments[2];" +
                "if (row > table.rows.length) { return \"Cannot access row \" + row + \" - table has \" + table.rows.length + \" rows\"; }" +
                "if (col > table.rows[row].cells.length) { return \"Cannot access column \" + col + \" - table row has \" + table.rows[row].cells.length + \" columns\"; }" +
                "return table.rows[row].cells[col];";

            object returnValue = library.ExecuteScript(driver, script, table, row, col);
            IWebElement elementReturned = returnValue as IWebElement;
            if (elementReturned != null)
            {
                tableString = ((IWebElement)returnValue).Text.Trim();
            }
            else
            {
                throw new SeleniumException(returnValue.ToString());
            }

            return returnValue;
        }
    }
}