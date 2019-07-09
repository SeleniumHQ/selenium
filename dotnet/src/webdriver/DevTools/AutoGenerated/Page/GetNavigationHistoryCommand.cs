namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns navigation history for the current page.
    /// </summary>
    public sealed class GetNavigationHistoryCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.getNavigationHistory";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetNavigationHistoryCommandResponse : ICommandResponse<GetNavigationHistoryCommandSettings>
    {
        /// <summary>
        /// Index of the current navigation history entry.
        ///</summary>
        [JsonProperty("currentIndex")]
        public long CurrentIndex
        {
            get;
            set;
        }
        /// <summary>
        /// Array of navigation history entries.
        ///</summary>
        [JsonProperty("entries")]
        public NavigationEntry[] Entries
        {
            get;
            set;
        }
    }
}