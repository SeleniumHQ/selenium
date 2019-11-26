namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Deletes a BrowserContext. All the belonging pages will be closed without calling their
    /// beforeunload hooks.
    /// </summary>
    public sealed class DisposeBrowserContextCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.disposeBrowserContext";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the browserContextId
        /// </summary>
        [JsonProperty("browserContextId")]
        public string BrowserContextId
        {
            get;
            set;
        }
    }

    public sealed class DisposeBrowserContextCommandResponse : ICommandResponse<DisposeBrowserContextCommandSettings>
    {
    }
}