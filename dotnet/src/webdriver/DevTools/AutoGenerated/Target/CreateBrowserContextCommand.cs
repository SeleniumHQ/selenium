namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Creates a new empty BrowserContext. Similar to an incognito profile but you can have more than
    /// one.
    /// </summary>
    public sealed class CreateBrowserContextCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.createBrowserContext";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class CreateBrowserContextCommandResponse : ICommandResponse<CreateBrowserContextCommandSettings>
    {
        /// <summary>
        /// The id of the context created.
        ///</summary>
        [JsonProperty("browserContextId")]
        public string BrowserContextId
        {
            get;
            set;
        }
    }
}