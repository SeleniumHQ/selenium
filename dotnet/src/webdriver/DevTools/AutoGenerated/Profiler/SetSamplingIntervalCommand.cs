namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Changes CPU profiler sampling interval. Must be called before CPU profiles recording started.
    /// </summary>
    public sealed class SetSamplingIntervalCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.setSamplingInterval";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// New sampling interval in microseconds.
        /// </summary>
        [JsonProperty("interval")]
        public long Interval
        {
            get;
            set;
        }
    }

    public sealed class SetSamplingIntervalCommandResponse : ICommandResponse<SetSamplingIntervalCommandSettings>
    {
    }
}