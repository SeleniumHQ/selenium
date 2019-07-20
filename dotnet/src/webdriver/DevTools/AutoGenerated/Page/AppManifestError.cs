namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Error while paring app manifest.
    /// </summary>
    public sealed class AppManifestError
    {
        /// <summary>
        /// Error message.
        ///</summary>
        [JsonProperty("message")]
        public string Message
        {
            get;
            set;
        }
        /// <summary>
        /// If criticial, this is a non-recoverable parse error.
        ///</summary>
        [JsonProperty("critical")]
        public long Critical
        {
            get;
            set;
        }
        /// <summary>
        /// Error line.
        ///</summary>
        [JsonProperty("line")]
        public long Line
        {
            get;
            set;
        }
        /// <summary>
        /// Error column.
        ///</summary>
        [JsonProperty("column")]
        public long Column
        {
            get;
            set;
        }
    }
}