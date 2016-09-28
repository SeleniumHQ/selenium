// <copyright file="TableRowElement.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
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