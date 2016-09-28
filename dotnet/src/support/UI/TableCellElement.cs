// <copyright file="TableCellElement.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    ///     Wraps an IWebElement into a user-friendly table-data-element
    /// </summary>
    public class TableCellElement
    {
        private IWebElement cellElement;

        /// <summary>
        /// Initializes a new instance of the <see cref="TableCellElement"/> class.
        /// </summary>
        /// <param name="cell">The IWebElement that is wrapped</param>
        public TableCellElement(IWebElement cell)
        {
            this.cellElement = cell;
        }

        /// <summary>
        /// Gets the WebElement for further purpose and flexible interoperation
        /// </summary>
        public IWebElement Cell => this.cellElement;

        /// <summary>
        /// Gets the html tagname of the IWebElement
        /// </summary>
        public string TagName => this.Cell.TagName;

        /// <summary>
        /// Gets the inner Text of the WebElement
        /// </summary>
        public string Text => this.Cell.Text;
    }
}