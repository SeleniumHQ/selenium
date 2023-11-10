using System;

namespace OpenQA.Selenium.Internal.Logging
{
    public sealed class LogEvent
    {
        public LogEvent(Type issuedBy, DateTime timeStamp, Level level, string message)
        {
            IssuedBy = issuedBy;
            TimeStamp = timeStamp;
            Level = level;
            Message = message;
        }

        public Type IssuedBy { get; }

        public DateTime TimeStamp { get; }

        public Level Level { get; }

        public string Message { get; }

    }
}
