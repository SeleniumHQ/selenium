using System;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class Logger : ILogger
    {
        private readonly Type _type;

        public Logger(Type type, LogLevel level)
        {
            _type = type;
            Level = level;
        }

        public LogLevel Level { get; set; }

        public void Trace(string message)
        {
            LogMessage(LogLevel.Trace, message);
        }

        public void Debug(string message)
        {
            LogMessage(LogLevel.Debug, message);
        }

        public void Info(string message)
        {
            LogMessage(LogLevel.Info, message);
        }

        public void Warn(string message)
        {
            LogMessage(LogLevel.Warn, message);
        }

        public void Error(string message)
        {
            LogMessage(LogLevel.Error, message);
        }

        private void LogMessage(LogLevel level, string message)
        {
            if (level >= Level)
            {
                // route message to contextual log
                var logMessage = new LogMessage(_type, DateTime.Now, level, message);
                Log.Context.LogMessage(logMessage);
            }
        }
    }
}
