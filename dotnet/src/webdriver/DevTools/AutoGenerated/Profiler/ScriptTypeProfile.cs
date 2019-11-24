namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Type profile data collected during runtime for a JavaScript script.
    /// </summary>
    public sealed class ScriptTypeProfile
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
        /// Type profile entries for parameters and return values of the functions in the script.
        ///</summary>
        [JsonProperty("entries")]
        public TypeProfileEntry[] Entries
        {
            get;
            set;
        }
    }
}