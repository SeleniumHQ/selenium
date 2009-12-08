using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.Internal
{
    public interface IFindsByPartialLinkText
    {
        IWebElement FindElementByPartialLinkText(String partialLinkText);
        List<IWebElement> FindElementsByPartialLinkText(String partialLinkText);
    }
}
