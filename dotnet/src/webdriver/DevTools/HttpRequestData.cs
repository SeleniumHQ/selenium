using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public class HttpRequestData
    {
        public string Method { get; internal set; }
        public string Url { get; internal set; }
        public string PostData { get; internal set; }
        public Dictionary<string, string> Headers { get; internal set; }
        public string RequestId { get; internal set; }
    }
}
