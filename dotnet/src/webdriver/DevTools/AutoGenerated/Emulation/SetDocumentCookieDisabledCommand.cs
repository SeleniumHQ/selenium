namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// SetDocumentCookieDisabled
    /// </summary>
    public sealed class SetDocumentCookieDisabledCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setDocumentCookieDisabled";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Whether document.coookie API should be disabled.
        /// </summary>
        [JsonProperty("disabled")]
        public bool Disabled
        {
            get;
            set;
        }
    }

    public sealed class SetDocumentCookieDisabledCommandResponse : ICommandResponse<SetDocumentCookieDisabledCommandSettings>
    {
    }
}