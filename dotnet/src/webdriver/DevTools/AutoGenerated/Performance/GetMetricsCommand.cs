namespace OpenQA.Selenium.DevTools.Performance
{
    using Newtonsoft.Json;

    /// <summary>
    /// Retrieve current values of run-time metrics.
    /// </summary>
    public sealed class GetMetricsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Performance.getMetrics";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetMetricsCommandResponse : ICommandResponse<GetMetricsCommandSettings>
    {
        /// <summary>
        /// Current values for run-time metrics.
        ///</summary>
        [JsonProperty("metrics")]
        public Metric[] Metrics
        {
            get;
            set;
        }
    }
}