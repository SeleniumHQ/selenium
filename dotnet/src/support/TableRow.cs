using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    ///     Wraps an IWebElement into a user-friendly table-row-element
    /// </summary>
    public class TableRow
    {
        public readonly OpenQA.Selenium.IWebElement WebElement;

        /// <summary>
        ///     Creates a table-row-element object
        /// </summary>
        /// <param name="webElement">The IWebElement that is wrapped</param>
        public TableRow(OpenQA.Selenium.IWebElement webElement)
        {
            WebElement = webElement;
        }

        /// <summary>
        ///     List with data cells (zero based index)
        /// </summary>
        public IList<TableCell> DataCells => TheCells("td");

        /// <summary>
        ///     List with header cells (zero based index)
        /// </summary>
        public IList<TableCell> HeaderCells => TheCells("th");

        /// <summary>
        ///     List with cells to a given tag name (zero based index)
        /// </summary>
        private IList<TableCell> TheCells(string tagName)
        {
            var webElements = WebElement.FindElements(By.TagName(tagName));
            return webElements.Select(e => new TableCell(e)).ToList();
        }
    }
}
