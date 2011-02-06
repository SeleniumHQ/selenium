namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Provides the lookup methods for the FindsBy attribute (for using in PageObjects)
    /// </summary>
    public enum How
    {
        ///<see cref="OpenQA.Selenium.By.Id" />
        Id,
        ///<see cref="OpenQA.Selenium.By.Name" />
        Name,
        ///<see cref="OpenQA.Selenium.By.TagName" />
        TagName,
        ///<see cref="OpenQA.Selenium.By.ClassName" />
        ClassName,
        ///<see cref="OpenQA.Selenium.By.CssSelector" />
        CssSelector,
        ///<see cref="OpenQA.Selenium.By.LinkText" />
        LinkText,
        ///<see cref="OpenQA.Selenium.By.PartialLinkText" />
        PartialLinkText,
        ///<see cref="OpenQA.Selenium.By.XPath" />
        XPath
    }
}