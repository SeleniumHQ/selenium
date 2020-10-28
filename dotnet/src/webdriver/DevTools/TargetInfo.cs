using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public class TargetInfo
    {
        public string TargetId { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }

        public bool IsAttached { get; set; }

        public string OpenerId { get; set; }

        public string BrowserContextId { get; set; }
    }
}
