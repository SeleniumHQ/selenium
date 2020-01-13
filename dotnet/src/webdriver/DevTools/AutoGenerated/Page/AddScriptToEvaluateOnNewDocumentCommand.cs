namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Evaluates given script in every frame upon creation (before loading frame's scripts).
    /// </summary>
    public sealed class AddScriptToEvaluateOnNewDocumentCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.addScriptToEvaluateOnNewDocument";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the source
        /// </summary>
        [JsonProperty("source")]
        public string Source
        {
            get;
            set;
        }
        /// <summary>
        /// If specified, creates an isolated world with the given name and evaluates given script in it.
        /// This world name will be used as the ExecutionContextDescription::name when the corresponding
        /// event is emitted.
        /// </summary>
        [JsonProperty("worldName", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string WorldName
        {
            get;
            set;
        }
    }

    public sealed class AddScriptToEvaluateOnNewDocumentCommandResponse : ICommandResponse<AddScriptToEvaluateOnNewDocumentCommandSettings>
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