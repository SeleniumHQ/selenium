namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Turns on virtual time for all frames (replacing real-time with a synthetic time source) and sets
    /// the current virtual time policy.  Note this supersedes any previous time budget.
    /// </summary>
    public sealed class SetVirtualTimePolicyCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setVirtualTimePolicy";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the policy
        /// </summary>
        [JsonProperty("policy")]
        public VirtualTimePolicy Policy
        {
            get;
            set;
        }
        /// <summary>
        /// If set, after this many virtual milliseconds have elapsed virtual time will be paused and a
        /// virtualTimeBudgetExpired event is sent.
        /// </summary>
        [JsonProperty("budget", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? Budget
        {
            get;
            set;
        }
        /// <summary>
        /// If set this specifies the maximum number of tasks that can be run before virtual is forced
        /// forwards to prevent deadlock.
        /// </summary>
        [JsonProperty("maxVirtualTimeTaskStarvationCount", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? MaxVirtualTimeTaskStarvationCount
        {
            get;
            set;
        }
        /// <summary>
        /// If set the virtual time policy change should be deferred until any frame starts navigating.
        /// Note any previous deferred policy change is superseded.
        /// </summary>
        [JsonProperty("waitForNavigation", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? WaitForNavigation
        {
            get;
            set;
        }
        /// <summary>
        /// If set, base::Time::Now will be overriden to initially return this value.
        /// </summary>
        [JsonProperty("initialVirtualTime", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? InitialVirtualTime
        {
            get;
            set;
        }
    }

    public sealed class SetVirtualTimePolicyCommandResponse : ICommandResponse<SetVirtualTimePolicyCommandSettings>
    {
        /// <summary>
        /// Absolute timestamp at which virtual time was first enabled (up time in milliseconds).
        ///</summary>
        [JsonProperty("virtualTimeTicksBase")]
        public double VirtualTimeTicksBase
        {
            get;
            set;
        }
    }
}