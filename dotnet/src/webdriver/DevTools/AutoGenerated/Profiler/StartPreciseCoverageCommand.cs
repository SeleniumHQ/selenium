namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enable precise code coverage. Coverage data for JavaScript executed before enabling precise code
    /// coverage may be incomplete. Enabling prevents running optimized code and resets execution
    /// counters.
    /// </summary>
    public sealed class StartPreciseCoverageCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.startPreciseCoverage";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Collect accurate call counts beyond simple 'covered' or 'not covered'.
        /// </summary>
        [JsonProperty("callCount", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? CallCount
        {
            get;
            set;
        }
        /// <summary>
        /// Collect block-based coverage.
        /// </summary>
        [JsonProperty("detailed", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Detailed
        {
            get;
            set;
        }
    }

    public sealed class StartPreciseCoverageCommandResponse : ICommandResponse<StartPreciseCoverageCommandSettings>
    {
    }
}