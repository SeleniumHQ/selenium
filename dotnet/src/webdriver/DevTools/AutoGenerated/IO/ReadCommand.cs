namespace OpenQA.Selenium.DevTools.IO
{
    using Newtonsoft.Json;

    /// <summary>
    /// Read a chunk of the stream
    /// </summary>
    public sealed class ReadCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "IO.read";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Handle of the stream to read.
        /// </summary>
        [JsonProperty("handle")]
        public string Handle
        {
            get;
            set;
        }
        /// <summary>
        /// Seek to the specified offset before reading (if not specificed, proceed with offset
        /// following the last read). Some types of streams may only support sequential reads.
        /// </summary>
        [JsonProperty("offset", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Offset
        {
            get;
            set;
        }
        /// <summary>
        /// Maximum number of bytes to read (left upon the agent discretion if not specified).
        /// </summary>
        [JsonProperty("size", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Size
        {
            get;
            set;
        }
    }

    public sealed class ReadCommandResponse : ICommandResponse<ReadCommandSettings>
    {
        /// <summary>
        /// Set if the data is base64-encoded
        ///</summary>
        [JsonProperty("base64Encoded", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Base64Encoded
        {
            get;
            set;
        }
        /// <summary>
        /// Data that were read.
        ///</summary>
        [JsonProperty("data")]
        public string Data
        {
            get;
            set;
        }
        /// <summary>
        /// Set if the end-of-file condition occured while reading.
        ///</summary>
        [JsonProperty("eof")]
        public bool Eof
        {
            get;
            set;
        }
    }
}