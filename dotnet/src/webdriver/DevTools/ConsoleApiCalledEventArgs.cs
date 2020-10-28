using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public class ConsoleApiCalledEventArgs : EventArgs
    {
        public DateTime Timestamp { get; set; }
        public string Type { get; set; }

        public List<ConsoleApiArgument> Arguments { get; set; }
    }
}
