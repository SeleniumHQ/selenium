namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Navigates current page to the given history entry.
    /// </summary>
    public sealed class NavigateToHistoryEntryCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.navigateToHistoryEntry";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Unique id of the entry to navigate to.
        /// </summary>
        [JsonProperty("entryId")]
        public long EntryId
        {
            get;
            set;
        }
    }

    public sealed class NavigateToHistoryEntryCommandResponse : ICommandResponse<NavigateToHistoryEntryCommandSettings>
    {
    }
}