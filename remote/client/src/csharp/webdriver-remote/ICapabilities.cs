using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    public interface ICapabilities
    {
        string BrowserName { get; }

        Platform Platform { get; }

        string Version { get; }

        bool IsJavaScriptEnabled { get; }
    }
}
