// <copyright file="TableRowElement.cs" company="WebDriver Committers">
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

using System.Collections.Generic;

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    ///     Wraps an IWebElement into a user-friendly table-row-element
    /// </summary>
    public class TableRowElement
    {
        private readonly IWebElement webElement;

        /// <summary>
        /// Initializes a new instance of the <see cref="TableRowElement"/> class.
        /// </summary>
        /// <param name="webElement">The IWebElement that is wrapped</param>
        public TableRowElement(OpenQA.Selenium.IWebElement webElement)
        {
            this.webElement = webElement;
        }

        /// <summary>
        /// Gets the list of table header cells
        /// </summary>
        public IList<TableCellElement> HeaderCells => this.TheCells("th");

        /// <summary>
        /// Gets the list of table data cells
        /// </summary>
        public IList<TableCellElement> DataCells => this.TheCells("td");

        private IList<TableCellElement> TheCells(string tagName)
        {
            var webElements = this.webElement.FindElements(By.TagName(tagName));
            IList<TableCellElement> cellElements = new List<TableCellElement>(webElements.Count);
            foreach (var webElement in webElements)
            {
                cellElements.Add(new TableCellElement(webElement));
            }

            return cellElements;
        }
    }
}