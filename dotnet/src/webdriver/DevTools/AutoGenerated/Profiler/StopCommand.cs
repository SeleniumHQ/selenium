namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Stop
    /// </summary>
    public sealed class StopCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Profiler.stop";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class StopCommandResponse : ICommandResponse<StopCommandSettings>
    {
        /// <summary>
        /// Recorded profile.
        ///</summary>
        [JsonProperty("profile")]
        public Profile Profile
        {
            get;
            set;
        }
    }
}