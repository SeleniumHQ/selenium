using System;
namespace OpenQA.Selenium.Internal.Logging
{
    public sealed class LogMessage
    {
        public LogMessage(Type issuedBy, DateTime timeStamp, LogLevel level, string message)
        {
            IssuedBy = issuedBy;
            TimeStamp = timeStamp;
            Level = level;
            Message = message;
        }

        public Type IssuedBy { get; }

        public DateTime TimeStamp { get; }

        public LogLevel Level { get; }

        public string Message { get; }

    }
}
