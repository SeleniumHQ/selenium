namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Makes page not interrupt on any pauses (breakpoint, exception, dom exception etc).
    /// </summary>
    public sealed class SetSkipAllPausesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.setSkipAllPauses";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// New value for skip pauses state.
        /// </summary>
        [JsonProperty("skip")]
        public bool Skip
        {
            get;
            set;
        }
    }

    public sealed class SetSkipAllPausesCommandResponse : ICommandResponse<SetSkipAllPausesCommandSettings>
    {
    }
}