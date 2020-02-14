namespace OpenQA.Selenium.DevTools.Performance
{
    using Newtonsoft.Json;

    /// <summary>
    /// Run-time execution metric.
    /// </summary>
    public sealed class Metric
    {
        /// <summary>
        /// Metric name.
        ///</summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Metric value.
        ///</summary>
        [JsonProperty("value")]
        public double Value
        {
            get;
            set;
        }
    }
}