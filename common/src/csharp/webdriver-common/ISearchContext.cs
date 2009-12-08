using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public interface ISearchContext
    {
        IWebElement FindElement(By by);

        List<IWebElement> FindElements(By by);
    }
}
