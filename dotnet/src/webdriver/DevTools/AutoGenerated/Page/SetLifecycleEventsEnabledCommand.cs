namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Controls whether page will emit lifecycle events.
    /// </summary>
    public sealed class SetLifecycleEventsEnabledCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.setLifecycleEventsEnabled";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// If true, starts emitting lifecycle events.
        /// </summary>
        [JsonProperty("enabled")]
        public bool Enabled
        {
            get;
            set;
        }
    }

    public sealed class SetLifecycleEventsEnabledCommandResponse : ICommandResponse<SetLifecycleEventsEnabledCommandSettings>
    {
    }
}