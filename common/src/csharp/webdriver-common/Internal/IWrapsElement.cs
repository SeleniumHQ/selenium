using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.Internal
{
    public interface IWrapsElement
    {
        IWebElement WrappedElement { get; }
    }
}
