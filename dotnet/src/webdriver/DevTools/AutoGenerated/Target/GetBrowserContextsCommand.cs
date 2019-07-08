namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns all browser contexts created with `Target.createBrowserContext` method.
    /// </summary>
    public sealed class GetBrowserContextsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.getBrowserContexts";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetBrowserContextsCommandResponse : ICommandResponse<GetBrowserContextsCommandSettings>
    {
        /// <summary>
        /// An array of browser context ids.
        ///</summary>
        [JsonProperty("browserContextIds")]
        public string[] BrowserContextIds
        {
            get;
            set;
        }
    }
}