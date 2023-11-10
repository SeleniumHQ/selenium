using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Internal.Logging
{
    public class ConsoleLogHandler : ILogHandler
    {
        private static readonly Dictionary<Level, string> _levelMap = new Dictionary<Level, string>
        {
            { Level.Trace, "TRC" },
            { Level.Debug, "DBG" },
            { Level.Info, "INF" },
            { Level.Warn, "WRN" },
            { Level.Error, "ERR" }
        };

        public void Handle(LogEvent logEvent)
        {
            Console.WriteLine($"{logEvent.TimeStamp:HH:mm:ss.fff} {_levelMap[logEvent.Level]} {logEvent.IssuedBy.Name}: {logEvent.Message}");
        }
    }
}
