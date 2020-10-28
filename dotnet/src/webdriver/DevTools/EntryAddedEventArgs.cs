using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public class EntryAddedEventArgs : EventArgs
    {
        public LogEntry Entry { get; set; }
    }
}
