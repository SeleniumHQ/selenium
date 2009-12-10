using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    public interface IWrapsElement
    {
        IWebElement WrappedElement { get; }
    }
}
