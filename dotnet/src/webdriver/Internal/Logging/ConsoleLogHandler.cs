using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Internal.Logging
{
    public class ConsoleLogHandler : ILogHandler
    {
        private static readonly Dictionary<LogLevel, string> _levelMap = new Dictionary<LogLevel, string>
        {
            { LogLevel.Trace, "TRC" },
            { LogLevel.Debug, "DBG" },
            { LogLevel.Info, "INF" },
            { LogLevel.Warn, "WARN" },
            { LogLevel.Error, "ERR" }
        };

        public void Handle(LogMessage logMessage)
        {
            Console.WriteLine($"{logMessage.TimeStamp:HH:mm:ss.fff} {_levelMap[logMessage.Level]} {logMessage.IssuedBy.Name}: {logMessage.Message}");
        }
    }
}
