using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.Support.UI
{
  /// <summary>
  ///   Wraps an IWebElement into a user-friendly table-element
  /// </summary>
  public class Table
  {
    private static readonly string TagName = "table";
    private readonly OpenQA.Selenium.IWebElement _table;

    /// <summary>
    ///   Creates a table object
    /// </summary>
    /// <param name="table">The IWebElement that is wrapped</param>
    public Table(OpenQA.Selenium.IWebElement table)
    {
      CheckType(table);
      _table = table;
    }

    /// <summary>
    ///   The caption of the table
    /// </summary>
    public OpenQA.Selenium.IWebElement Caption => Section("caption");

    /// <summary>
    ///   The table rows in the header section
    /// </summary>
    public IList<TableRow> HeaderRows => TheRows(Section("thead"));

    /// <summary>
    ///   The table rows in the footer section
    /// </summary>
    public IList<TableRow> FooterRows => TheRows(Section("tfoot"));

    /// <summary>
    ///   The table rows in the body section (zero based index)
    /// </summary>
    public IList<TableRow> BodyRows => TheRows(Section("tbody"));

    /// <summary>
    ///   The table rows in the entire table (any section)
    /// </summary>
    public IList<TableRow> Rows => TheRows(_table);

    private OpenQA.Selenium.IWebElement Section(string tagName)
    {
      return _table.FindElement(By.TagName(tagName));
    }

    private static void CheckType(OpenQA.Selenium.IWebElement webElement)
    {
      if (!webElement.TagName.Equals(TagName))
        throw new UnexpectedTagNameException(TagName, webElement.TagName);
    }

    private static IList<TableRow> TheRows(OpenQA.Selenium.IWebElement parentElement)
    {
      var webElements = parentElement.FindElements(By.TagName("tr"));
      var list = new List<TableRow>(webElements.Count);
      list.AddRange(webElements.Select(webElement => new TableRow(webElement)));
      return list;
    }
  }
}
