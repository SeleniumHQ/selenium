// <copyright file="GetTable.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System.Globalization;
using System.Text.RegularExpressions;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getTable keyword.
    /// </summary>
    internal class GetTable : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="GetTable"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public GetTable(ElementFinder elementFinder)
        {
            this.finder = elementFinder;
        }

        private static Regex TableParts
        {
            get { return new Regex("(.*)\\.(\\d+)\\.(\\d+)"); }
        }

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string tableString = string.Empty;

            if (!TableParts.IsMatch(locator))
            {
                throw new SeleniumException("Invalid target format. Correct format is tableName.rowNum.columnNum");
            }

            Match tableMatch = TableParts.Match(locator);
            string tableName = tableMatch.Groups[1].Value;
            long row = int.Parse(tableMatch.Groups[2].Value, CultureInfo.InvariantCulture);
            long col = int.Parse(tableMatch.Groups[3].Value, CultureInfo.InvariantCulture);

            IWebElement table = this.finder.FindElement(driver, tableName);

            string script =
                "var table = arguments[0]; var row = arguments[1]; var col = arguments[2];" +
                "if (row > table.rows.length) { return \"Cannot access row \" + row + \" - table has \" + table.rows.length + \" rows\"; }" +
                "if (col > table.rows[row].cells.length) { return \"Cannot access column \" + col + \" - table row has \" + table.rows[row].cells.length + \" columns\"; }" +
                "return table.rows[row].cells[col];";

            object returnValue = JavaScriptLibrary.ExecuteScript(driver, script, table, row, col);
            IWebElement elementReturned = returnValue as IWebElement;
            if (elementReturned != null)
            {
                tableString = elementReturned.Text.Trim();
            }
            else
            {
                throw new SeleniumException(returnValue.ToString());
            }

            return tableString;
        }
    }
}