namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// SetScrollbarsHidden
    /// </summary>
    public sealed class SetScrollbarsHiddenCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setScrollbarsHidden";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Whether scrollbars should be always hidden.
        /// </summary>
        [JsonProperty("hidden")]
        public bool Hidden
        {
            get;
            set;
        }
    }

    public sealed class SetScrollbarsHiddenCommandResponse : ICommandResponse<SetScrollbarsHiddenCommandSettings>
    {
    }
}