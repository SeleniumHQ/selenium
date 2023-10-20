namespace OpenQA.Selenium.Internal.Logging
{
    internal class Logger : ILogger
    {
        private LogLevel _level;

        public Logger(LogLevel level)
        {
            _level = level;
        }

        public ILogger SetLevel(LogLevel level)
        {
            _level = level;

            return this;
        }

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
            if (level >= _level)
            {
                Log.Instance.LogMessage(level, message);
            }
        }
    }
}
