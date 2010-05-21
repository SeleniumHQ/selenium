using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetTable : SeleneseCommand
    {
        private static readonly Regex TableParts = new Regex("(.*)\\.(\\d+)\\.(\\d+)");
        private ElementFinder finder;

        public GetTable(ElementFinder elementFinder)
        {
            this.finder = elementFinder;
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
            long row = int.Parse(tableMatch.Groups[1].Value, CultureInfo.InvariantCulture);
            long col = int.Parse(tableMatch.Groups[2].Value, CultureInfo.InvariantCulture);

            IWebElement table = finder.FindElement(driver, tableName);

            string script =
                "var table = arguments[0]; var row = arguments[1]; var col = arguments[2];" +
                "if (row > table.rows.length) { return \"Cannot access row \" + row + \" - table has \" + table.rows.length + \" rows\"; }" +
                "if (col > table.rows[row].cells.length) { return \"Cannot access column \" + col + \" - table row has \" + table.rows[row].cells.length + \" columns\"; }" +
                "return table.rows[row].cells[col];";

            object returnValue = JavaScriptLibrary.ExecuteScript(driver, script, table, row, col);
            IWebElement elementReturned = returnValue as IWebElement;
            if (elementReturned != null)
            {
                tableString = ((IWebElement)returnValue).Text.Trim();
            }
            else
            {
                throw new SeleniumException(returnValue.ToString());
            }

            return tableString;
        }
    }
}