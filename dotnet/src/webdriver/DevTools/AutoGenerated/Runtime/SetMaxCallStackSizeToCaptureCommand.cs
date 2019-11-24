namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// SetMaxCallStackSizeToCapture
    /// </summary>
    public sealed class SetMaxCallStackSizeToCaptureCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.setMaxCallStackSizeToCapture";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the size
        /// </summary>
        [JsonProperty("size")]
        public long Size
        {
            get;
            set;
        }
    }

    public sealed class SetMaxCallStackSizeToCaptureCommandResponse : ICommandResponse<SetMaxCallStackSizeToCaptureCommandSettings>
    {
    }
}