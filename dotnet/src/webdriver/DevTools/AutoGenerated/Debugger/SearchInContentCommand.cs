namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Searches for given string in script content.
    /// </summary>
    public sealed class SearchInContentCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.searchInContent";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the script to search in.
        /// </summary>
        [JsonProperty("scriptId")]
        public string ScriptId
        {
            get;
            set;
        }
        /// <summary>
        /// String to search for.
        /// </summary>
        [JsonProperty("query")]
        public string Query
        {
            get;
            set;
        }
        /// <summary>
        /// If true, search is case sensitive.
        /// </summary>
        [JsonProperty("caseSensitive", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? CaseSensitive
        {
            get;
            set;
        }
        /// <summary>
        /// If true, treats string parameter as regex.
        /// </summary>
        [JsonProperty("isRegex", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsRegex
        {
            get;
            set;
        }
    }

    public sealed class SearchInContentCommandResponse : ICommandResponse<SearchInContentCommandSettings>
    {
        /// <summary>
        /// List of search matches.
        ///</summary>
        [JsonProperty("result")]
        public SearchMatch[] Result
        {
            get;
            set;
        }
    }
}