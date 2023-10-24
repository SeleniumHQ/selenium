using System;
namespace OpenQA.Selenium.Internal.Logging
{
    public sealed class LogMessage
    {
        public LogMessage(Type issuer, DateTime timeStamp, LogLevel level, string message)
        {
            Issuer = issuer;
            TimeStamp = timeStamp;
            Level = level;
            Message = message;
        }

        public Type Issuer { get; }

        public DateTime TimeStamp { get; }

        public LogLevel Level { get; }

        public string Message { get; }

    }
}
