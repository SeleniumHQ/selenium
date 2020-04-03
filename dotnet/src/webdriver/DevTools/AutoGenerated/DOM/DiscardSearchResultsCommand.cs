namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Discards search results from the session with the given id. `getSearchResults` should no longer
    /// be called for that search.
    /// </summary>
    public sealed class DiscardSearchResultsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.discardSearchResults";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Unique search session identifier.
        /// </summary>
        [JsonProperty("searchId")]
        public string SearchId
        {
            get;
            set;
        }
    }

    public sealed class DiscardSearchResultsCommandResponse : ICommandResponse<DiscardSearchResultsCommandSettings>
    {
    }
}