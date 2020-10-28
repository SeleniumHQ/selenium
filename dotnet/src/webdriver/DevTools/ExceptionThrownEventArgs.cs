using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public class ExceptionThrownEventArgs : EventArgs
    {
        public DateTime Timestamp { get; internal set; }
        public string Message { get; internal set; }
    }
}
