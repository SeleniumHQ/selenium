namespace OpenQA.Selenium.DevTools.Input
{
    using Newtonsoft.Json;

    /// <summary>
    /// Ignores input events (useful while auditing page).
    /// </summary>
    public sealed class SetIgnoreInputEventsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Input.setIgnoreInputEvents";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Ignores input events processing when set to true.
        /// </summary>
        [JsonProperty("ignore")]
        public bool Ignore
        {
            get;
            set;
        }
    }

    public sealed class SetIgnoreInputEventsCommandResponse : ICommandResponse<SetIgnoreInputEventsCommandSettings>
    {
    }
}