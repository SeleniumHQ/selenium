using System;
namespace OpenQA.Selenium.Internal.Logging
{
    public sealed class LogMessage
    {
        public LogMessage(DateTime timeStamp, LogLevel level, string message)
        {
            TimeStamp = timeStamp;
            Level = level;
            Message = message;
        }

        public DateTime TimeStamp { get; }

        public LogLevel Level { get; }

        public string Message { get; }

    }
}
