using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.Internal
{
    public interface IFindsById
    {
        IWebElement FindElementById(String id);
        List<IWebElement> FindElementsById(String id);
    }
}
