namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Deprecated, please use removeScriptToEvaluateOnNewDocument instead.
    /// </summary>
    public sealed class RemoveScriptToEvaluateOnLoadCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.removeScriptToEvaluateOnLoad";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the identifier
        /// </summary>
        [JsonProperty("identifier")]
        public string Identifier
        {
            get;
            set;
        }
    }

    public sealed class RemoveScriptToEvaluateOnLoadCommandResponse : ICommandResponse<RemoveScriptToEvaluateOnLoadCommandSettings>
    {
    }
}