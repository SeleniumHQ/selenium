namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Get a Chrome histogram by name.
    /// </summary>
    public sealed class GetHistogramCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Browser.getHistogram";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Requested histogram name.
        /// </summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// If true, retrieve delta since last call.
        /// </summary>
        [JsonProperty("delta", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Delta
        {
            get;
            set;
        }
    }

    public sealed class GetHistogramCommandResponse : ICommandResponse<GetHistogramCommandSettings>
    {
        /// <summary>
        /// Histogram.
        ///</summary>
        [JsonProperty("histogram")]
        public Histogram Histogram
        {
            get;
            set;
        }
    }
}