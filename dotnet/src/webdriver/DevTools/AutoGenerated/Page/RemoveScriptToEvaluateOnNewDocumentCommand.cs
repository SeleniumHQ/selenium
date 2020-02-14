namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Removes given script from the list.
    /// </summary>
    public sealed class RemoveScriptToEvaluateOnNewDocumentCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.removeScriptToEvaluateOnNewDocument";
        
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

    public sealed class RemoveScriptToEvaluateOnNewDocumentCommandResponse : ICommandResponse<RemoveScriptToEvaluateOnNewDocumentCommandSettings>
    {
    }
}