using System;

namespace OpenQA.Selenium.Internal.Logging.Handlers
{
    public class ConsoleLogHandler : ILogHandler
    {
        public void Handle(LogMessage logMessage)
        {
            Console.WriteLine($"{logMessage.TimeStamp:HH:mm:ss.fff} {logMessage.Level} {logMessage.Message}");
        }
    }
}
