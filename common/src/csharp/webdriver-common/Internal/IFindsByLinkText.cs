using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    public interface IFindsByLinkText
    {
        IWebElement FindElementByLinkText(String linkText);
        ReadOnlyCollection<IWebElement> FindElementsByLinkText(String linkText);
    }
}
