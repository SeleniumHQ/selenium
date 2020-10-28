using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public class AuthRequiredEventArgs : EventArgs
    {
        public string Uri { get; internal set; }
        public string RequestId { get; internal set; }
    }
}
