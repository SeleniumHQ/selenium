namespace OpenQA.Selenium.DevTools.Performance
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Current values of the metrics.
    /// </summary>
    public sealed class MetricsEventArgs : EventArgs
    {
        /// <summary>
        /// Current values of the metrics.
        /// </summary>
        [JsonProperty("metrics")]
        public Metric[] Metrics
        {
            get;
            set;
        }
        /// <summary>
        /// Timestamp title.
        /// </summary>
        [JsonProperty("title")]
        public string Title
        {
            get;
            set;
        }
    }
}