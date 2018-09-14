namespace OpenQA.Selenium.Support.UI
{
  /// <summary>
  ///   Wraps an IWebElement into a user-friendly table-data-element
  /// </summary>
  public class TableCell
  {
    public readonly OpenQA.Selenium.IWebElement WebElement;

    /// <summary>
    ///   Creates a table-webElement-element object
    /// </summary>
    /// <param name="webElement">The IWebElement that is wrapped</param>
    public TableCell(OpenQA.Selenium.IWebElement webElement)
    {
      WebElement = webElement;
    }

    /// <summary>
    ///   The html tagname of the IWebElement
    /// </summary>
    public string TagName => WebElement.TagName;

    public string Text => WebElement.Text;
  }
}
