namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Search match for resource.
    /// </summary>
    public sealed class SearchMatch
    {
        /// <summary>
        /// Line number in resource content.
        ///</summary>
        [JsonProperty("lineNumber")]
        public double LineNumber
        {
            get;
            set;
        }
        /// <summary>
        /// Line with match content.
        ///</summary>
        [JsonProperty("lineContent")]
        public string LineContent
        {
            get;
            set;
        }
    }
}