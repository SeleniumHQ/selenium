using System;

namespace OpenQA.Selenium.Internal.Logging
{
    public sealed class LogEvent
    {
        public LogEvent(Type issuedBy, DateTime timeStamp, LogEventLevel level, string message)
        {
            IssuedBy = issuedBy;
            TimeStamp = timeStamp;
            Level = level;
            Message = message;
        }

        public Type IssuedBy { get; }

        public DateTime TimeStamp { get; }

        public LogEventLevel Level { get; }

        public string Message { get; }

    }
}
