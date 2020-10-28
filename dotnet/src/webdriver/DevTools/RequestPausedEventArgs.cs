using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public class RequestPausedEventArgs : EventArgs
    {
        public string RequestId { get; internal set; }
        public HttpRequestData RequestData { get; internal set; }
    }
}
