using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public class BindingCalledEventArgs : EventArgs
    {
        public long ExecutionContextId { get; internal set; }
        public string Name { get; internal set; }
        public string Payload { get; internal set; }
    }
}
