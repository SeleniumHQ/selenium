namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// DomContentEventFired
    /// </summary>
    public sealed class DomContentEventFiredEventArgs : EventArgs
    {
        /// <summary>
        /// Gets or sets the timestamp
        /// </summary>
        [JsonProperty("timestamp")]
        public double Timestamp
        {
            get;
            set;
        }
    }
}