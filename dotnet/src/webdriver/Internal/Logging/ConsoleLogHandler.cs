using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Internal.Logging
{
    public class ConsoleLogHandler : ILogHandler
    {
        private static readonly Dictionary<LogEventLevel, string> _levelMap = new Dictionary<LogEventLevel, string>
        {
            { LogEventLevel.Trace, "TRC" },
            { LogEventLevel.Debug, "DBG" },
            { LogEventLevel.Info, "INF" },
            { LogEventLevel.Warn, "WRN" },
            { LogEventLevel.Error, "ERR" }
        };

        public void Handle(LogEvent logEvent)
        {
            Console.WriteLine($"{logEvent.Timestamp:HH:mm:ss.fff} {_levelMap[logEvent.Level]} {logEvent.IssuedBy.Name}: {logEvent.Message}");
        }

        public ILogHandler Clone()
        {
            return this;
        }
    }
}
