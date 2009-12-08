using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.Internal
{
    public interface IFindsByLinkText
    {
        IWebElement FindElementByLinkText(String linkText);
        List<IWebElement> FindElementsByLinkText(String linkText);
    }
}
