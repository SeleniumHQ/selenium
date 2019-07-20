namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Coverage data for a JavaScript script.
    /// </summary>
    public sealed class ScriptCoverage
    {
        /// <summary>
        /// JavaScript script id.
        ///</summary>
        [JsonProperty("scriptId")]
        public string ScriptId
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript script name or url.
        ///</summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Functions contained in the script that has coverage data.
        ///</summary>
        [JsonProperty("functions")]
        public FunctionCoverage[] Functions
        {
            get;
            set;
        }
    }
}