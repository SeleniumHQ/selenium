namespace OpenQA.Selenium.Internal.Logging
{
    public interface ILogManager
    {
        ILogger GetLogger(string name);

        void LogMessage(LogLevel level, string message);

        ILogManager SetLevel(LogLevel level);

        ILogManager AddHandler(ILogHandler handler);
    }
}
