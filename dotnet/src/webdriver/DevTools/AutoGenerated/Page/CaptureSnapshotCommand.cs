namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns a snapshot of the page as a string. For MHTML format, the serialization includes
    /// iframes, shadow DOM, external resources, and element-inline styles.
    /// </summary>
    public sealed class CaptureSnapshotCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.captureSnapshot";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Format (defaults to mhtml).
        /// </summary>
        [JsonProperty("format", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Format
        {
            get;
            set;
        }
    }

    public sealed class CaptureSnapshotCommandResponse : ICommandResponse<CaptureSnapshotCommandSettings>
    {
        /// <summary>
        /// Serialized page data.
        ///</summary>
        [JsonProperty("data")]
        public string Data
        {
            get;
            set;
        }
    }
}