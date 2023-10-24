namespace OpenQA.Selenium.Internal.Logging
{
    public interface ILogger
    {
        void Trace(string message);

        void Debug(string message);

        void Info(string message);

        void Warn(string message);

        void Error(string message);

        LogLevel Level { get; set; }
    }
}
