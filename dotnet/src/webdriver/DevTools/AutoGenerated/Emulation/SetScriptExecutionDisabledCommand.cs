namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Switches script execution in the page.
    /// </summary>
    public sealed class SetScriptExecutionDisabledCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setScriptExecutionDisabled";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Whether script execution should be disabled in the page.
        /// </summary>
        [JsonProperty("value")]
        public bool Value
        {
            get;
            set;
        }
    }

    public sealed class SetScriptExecutionDisabledCommandResponse : ICommandResponse<SetScriptExecutionDisabledCommandSettings>
    {
    }
}