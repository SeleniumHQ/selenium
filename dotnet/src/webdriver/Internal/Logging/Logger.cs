using System;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class Logger : ILogger
    {
        public Logger(Type issuer, LogEventLevel level)
        {
            Issuer = issuer;
            Level = level;
        }

        public LogEventLevel Level { get; set; }

        public Type Issuer { get; internal set; }

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
            Log.CurrentContext.LogMessage(this, level, message);
        }
    }
}
