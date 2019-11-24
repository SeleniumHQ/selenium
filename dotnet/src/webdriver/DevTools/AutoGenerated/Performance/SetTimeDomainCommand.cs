namespace OpenQA.Selenium.DevTools.Performance
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets time domain to use for collecting and reporting duration metrics.
    /// Note that this must be called before enabling metrics collection. Calling
    /// this method while metrics collection is enabled returns an error.
    /// </summary>
    public sealed class SetTimeDomainCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Performance.setTimeDomain";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Time domain
        /// </summary>
        [JsonProperty("timeDomain")]
        public string TimeDomain
        {
            get;
            set;
        }
    }

    public sealed class SetTimeDomainCommandResponse : ICommandResponse<SetTimeDomainCommandSettings>
    {
    }
}