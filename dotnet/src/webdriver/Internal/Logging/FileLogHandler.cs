using System;
using System.IO;

namespace OpenQA.Selenium.Internal.Logging
{
    /// <summary>
    /// Represents a log handler that writes log events to a file.
    /// </summary>
    public class FileLogHandler : ILogHandler, IDisposable
    {
        // performance trick to avoid expensive Enum.ToString() with fixed length
        private static readonly string[] _levels = { "TRACE", "DEBUG", " INFO", " WARN", "ERROR" };

        private FileStream _fileStream;
        private StreamWriter _streamWriter;

        private readonly object _lockObj = new object();
        private bool _isDisposed;

        /// <summary>
        /// Initializes a new instance of the <see cref="FileLogHandler"/> class with the specified file path.
        /// </summary>
        /// <param name="path">The path of the log file.</param>
        public FileLogHandler(string path)
        {
            if (path is null) throw new ArgumentNullException(nameof(path));

            _fileStream = File.Open(path, FileMode.OpenOrCreate, FileAccess.Write, FileShare.Read);
            _fileStream.Seek(0, SeekOrigin.End);
            _streamWriter = new StreamWriter(_fileStream, System.Text.Encoding.UTF8)
            {
                AutoFlush = true
            };
        }

        /// <summary>
        /// Handles a log event by writing it to the log file.
        /// </summary>
        /// <param name="logEvent">The log event to handle.</param>
        public void Handle(LogEvent logEvent)
        {
            lock (_lockObj)
            {
                _streamWriter.WriteLine($"{logEvent.Timestamp:HH:mm:ss.fff} {_levels[(int)logEvent.Level]} {logEvent.IssuedBy.Name}: {logEvent.Message}");
            }
        }

        /// <summary>
        /// Disposes the file log handler and releases any resources used.
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Disposes the file log handler and releases any resources used.
        /// </summary>
        /// <param name="disposing">A flag indicating whether to dispose managed resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!_isDisposed)
            {
                if (disposing)
                {
                    _streamWriter?.Dispose();
                    _streamWriter = null;
                    _fileStream?.Dispose();
                    _fileStream = null;
                }

                _isDisposed = true;
            }
        }
    }
}
