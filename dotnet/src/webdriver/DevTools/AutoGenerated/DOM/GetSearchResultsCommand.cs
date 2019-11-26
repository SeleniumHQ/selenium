namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns search results from given `fromIndex` to given `toIndex` from the search with the given
    /// identifier.
    /// </summary>
    public sealed class GetSearchResultsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.getSearchResults";
        
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
        /// <summary>
        /// Start index of the search result to be returned.
        /// </summary>
        [JsonProperty("fromIndex")]
        public long FromIndex
        {
            get;
            set;
        }
        /// <summary>
        /// End index of the search result to be returned.
        /// </summary>
        [JsonProperty("toIndex")]
        public long ToIndex
        {
            get;
            set;
        }
    }

    public sealed class GetSearchResultsCommandResponse : ICommandResponse<GetSearchResultsCommandSettings>
    {
        /// <summary>
        /// Ids of the search result nodes.
        ///</summary>
        [JsonProperty("nodeIds")]
        public long[] NodeIds
        {
            get;
            set;
        }
    }
}