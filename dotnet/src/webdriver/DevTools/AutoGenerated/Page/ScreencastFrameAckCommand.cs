namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Acknowledges that a screencast frame has been received by the frontend.
    /// </summary>
    public sealed class ScreencastFrameAckCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.screencastFrameAck";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Frame number.
        /// </summary>
        [JsonProperty("sessionId")]
        public long SessionId
        {
            get;
            set;
        }
    }

    public sealed class ScreencastFrameAckCommandResponse : ICommandResponse<ScreencastFrameAckCommandSettings>
    {
    }
}