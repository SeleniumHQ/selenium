using System;

namespace OpenQA.Selenium.Internal.Logging
{
    public sealed class LogEvent
    {
        public LogEvent(Type issuedBy, DateTimeOffset timestamp, LogEventLevel level, string message)
        {
            IssuedBy = issuedBy;
            Timestamp = timestamp;
            Level = level;
            Message = message;
        }

        public Type IssuedBy { get; }

        public DateTimeOffset Timestamp { get; }

        public LogEventLevel Level { get; }

        public string Message { get; }

    }
}
