namespace OpenQA.Selenium.DevTools
{
    using System;

    /// <summary>
    /// The level of the log data emitted.
    /// </summary>
    public enum DevToolsSessionLogLevel
    {
        /// <summary>
        /// Log at the trace level.
        /// </summary>
        Trace,

        /// <summary>
        /// Log at the error level.
        /// </summary>
        Error
    }

    /// <summary>
    /// Represents the data used when the DevToolsSession object emits log data.
    /// </summary>
    public class DevToolsSessionLogMessageEventArgs : EventArgs
    {
        /// <summary>
        /// Initializes a new instance of the DevToolsSessionLogMessageEventArgs class.
        /// </summary>
        /// <param name="level">The level of the log message.</param>
        /// <param name="message">The content of the log message.</param>
        /// <param name="args">Arguments to be substituted when the message is formatted.</param>
        public DevToolsSessionLogMessageEventArgs(DevToolsSessionLogLevel level, string message, params object[] args)
        {
            Level = level;
            Message = string.Format(message, args);
        }

        /// <summary>
        /// Gets the message content.
        /// </summary>
        public string Message { get; }

        /// <summary>
        /// Gets the message log level.
        /// </summary>
        public DevToolsSessionLogLevel Level { get; }
    }
}
