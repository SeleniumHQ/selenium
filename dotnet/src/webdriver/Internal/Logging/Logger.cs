using System;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class Logger : ILogger
    {
        private readonly Type _type;

        public Logger(Type type, LogEventLevel level)
        {
            _type = type;
            Level = level;
        }

        public LogEventLevel Level { get; set; }

        public void Trace(string message)
        {
            LogMessage(LogEventLevel.Trace, message);
        }

        public void Debug(string message)
        {
            LogMessage(LogEventLevel.Debug, message);
        }

        public void Info(string message)
        {
            LogMessage(LogEventLevel.Info, message);
        }

        public void Warn(string message)
        {
            LogMessage(LogEventLevel.Warn, message);
        }

        public void Error(string message)
        {
            LogMessage(LogEventLevel.Error, message);
        }

        private void LogMessage(LogEventLevel level, string message)
        {
            if (level >= Level)
            {
                // route message to contextual log
                var logEvent = new LogEvent(_type, DateTime.Now, level, message);

                Log.ForContext.LogMessage(logEvent);
            }
        }
    }
}
