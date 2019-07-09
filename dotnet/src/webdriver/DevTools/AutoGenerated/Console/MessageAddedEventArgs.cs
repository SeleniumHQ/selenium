namespace OpenQA.Selenium.DevTools.Console
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when new console message is added.
    /// </summary>
    public sealed class MessageAddedEventArgs : EventArgs
    {
        /// <summary>
        /// Console message that has been added.
        /// </summary>
        [JsonProperty("message")]
        public ConsoleMessage Message
        {
            get;
            set;
        }
    }
}