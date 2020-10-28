using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public interface IDomains
    {
        DevToolsSessionDomains VersionSpecificDomains { get; }

        INetwork Network { get; }

        IJavaScript JavaScript { get; }

        ITarget Target { get; }

        ILog Log { get; }
    }
}
