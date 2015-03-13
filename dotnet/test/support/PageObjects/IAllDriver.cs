using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.PageObjects
{
    public interface IAllDriver : IFindsById, IFindsByLinkText, IFindsByName, IFindsByXPath, IWebDriver
    {
        // Place holder
    }

    public interface IAllElement : IWebElement
    {
        // Place holder
    }
}
