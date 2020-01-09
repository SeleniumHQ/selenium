namespace OpenQA.Selenium.DevTools.IO
{
    using Newtonsoft.Json;

    /// <summary>
    /// Return UUID of Blob object specified by a remote object id.
    /// </summary>
    public sealed class ResolveBlobCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "IO.resolveBlob";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Object id of a Blob object wrapper.
        /// </summary>
        [JsonProperty("objectId")]
        public string ObjectId
        {
            get;
            set;
        }
    }

    public sealed class ResolveBlobCommandResponse : ICommandResponse<ResolveBlobCommandSettings>
    {
        /// <summary>
        /// UUID of the specified Blob.
        ///</summary>
        [JsonProperty("uuid")]
        public string Uuid
        {
            get;
            set;
        }
    }
}