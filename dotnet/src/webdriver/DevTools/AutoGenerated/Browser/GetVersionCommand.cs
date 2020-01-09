namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns version information.
    /// </summary>
    public sealed class GetVersionCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Browser.getVersion";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetVersionCommandResponse : ICommandResponse<GetVersionCommandSettings>
    {
        /// <summary>
        /// Protocol version.
        ///</summary>
        [JsonProperty("protocolVersion")]
        public string ProtocolVersion
        {
            get;
            set;
        }
        /// <summary>
        /// Product name.
        ///</summary>
        [JsonProperty("product")]
        public string Product
        {
            get;
            set;
        }
        /// <summary>
        /// Product revision.
        ///</summary>
        [JsonProperty("revision")]
        public string Revision
        {
            get;
            set;
        }
        /// <summary>
        /// User-Agent.
        ///</summary>
        [JsonProperty("userAgent")]
        public string UserAgent
        {
            get;
            set;
        }
        /// <summary>
        /// V8 version.
        ///</summary>
        [JsonProperty("jsVersion")]
        public string JsVersion
        {
            get;
            set;
        }
    }
}