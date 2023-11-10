using System;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class Logger : ILogger
    {
        private readonly Type _type;

        public Logger(Type type, Level level)
        {
            _type = type;
            Level = level;
        }

        public Level Level { get; set; }

        public void Trace(string message)
        {
            LogMessage(Level.Trace, message);
        }

        public void Debug(string message)
        {
            LogMessage(Level.Debug, message);
        }

        public void Info(string message)
        {
            LogMessage(Level.Info, message);
        }

        public void Warn(string message)
        {
            LogMessage(Level.Warn, message);
        }

        public void Error(string message)
        {
            LogMessage(Level.Error, message);
        }

        private void LogMessage(Level level, string message)
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
