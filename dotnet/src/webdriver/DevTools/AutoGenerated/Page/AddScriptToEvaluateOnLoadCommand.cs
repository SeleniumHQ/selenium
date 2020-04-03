namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Deprecated, please use addScriptToEvaluateOnNewDocument instead.
    /// </summary>
    public sealed class AddScriptToEvaluateOnLoadCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.addScriptToEvaluateOnLoad";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the scriptSource
        /// </summary>
        [JsonProperty("scriptSource")]
        public string ScriptSource
        {
            get;
            set;
        }
    }

    public sealed class AddScriptToEvaluateOnLoadCommandResponse : ICommandResponse<AddScriptToEvaluateOnLoadCommandSettings>
    {
        /// <summary>
        /// Identifier of the added script.
        ///</summary>
        [JsonProperty("identifier")]
        public string Identifier
        {
            get;
            set;
        }
    }
}