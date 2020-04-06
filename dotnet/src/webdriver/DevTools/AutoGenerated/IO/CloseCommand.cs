namespace OpenQA.Selenium.DevTools.IO
{
    using Newtonsoft.Json;

    /// <summary>
    /// Close the stream, discard any temporary backing storage.
    /// </summary>
    public sealed class CloseCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "IO.close";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Handle of the stream to close.
        /// </summary>
        [JsonProperty("handle")]
        public string Handle
        {
            get;
            set;
        }
    }

    public sealed class CloseCommandResponse : ICommandResponse<CloseCommandSettings>
    {
    }
}