namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables CPU throttling to emulate slow CPUs.
    /// </summary>
    public sealed class SetCPUThrottlingRateCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setCPUThrottlingRate";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc).
        /// </summary>
        [JsonProperty("rate")]
        public double Rate
        {
            get;
            set;
        }
    }

    public sealed class SetCPUThrottlingRateCommandResponse : ICommandResponse<SetCPUThrottlingRateCommandSettings>
    {
    }
}