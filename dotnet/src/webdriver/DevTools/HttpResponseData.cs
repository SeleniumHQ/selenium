using OpenQA.Selenium.DevTools.V86.Fetch;
using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public class HttpResponseData
    {
        public long StatusCode { get; set; }
        public string Body { get; set; }
        public Dictionary<string, string> Headers { get; set; }
    }
}
