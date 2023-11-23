using System;

namespace OpenQA.Selenium.Internal.Logging
{
    public sealed class LogEvent
    {
        public LogEvent(Type issuedBy, DateTime timeStamp, LogEventLevel level, string message)
        {
            IssuedBy = issuedBy;
            Timestamp = timeStamp;
            Level = level;
            Message = message;
        }

        public Type IssuedBy { get; }

        public DateTime Timestamp { get; }

        public LogEventLevel Level { get; }

        public string Message { get; }

    }
}
