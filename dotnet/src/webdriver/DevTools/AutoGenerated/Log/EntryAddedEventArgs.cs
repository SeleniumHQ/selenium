namespace OpenQA.Selenium.DevTools.Log
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when new message was logged.
    /// </summary>
    public sealed class EntryAddedEventArgs : EventArgs
    {
        /// <summary>
        /// The entry.
        /// </summary>
        [JsonProperty("entry")]
        public LogEntry Entry
        {
            get;
            set;
        }
    }
}