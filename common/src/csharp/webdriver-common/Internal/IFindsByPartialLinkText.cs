using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    public interface IFindsByPartialLinkText
    {
        IWebElement FindElementByPartialLinkText(String partialLinkText);
        ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(String partialLinkText);
    }
}
