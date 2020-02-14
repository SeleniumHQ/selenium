namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Resizes the frame/viewport of the page. Note that this does not affect the frame's container
    /// (e.g. browser window). Can be used to produce screenshots of the specified size. Not supported
    /// on Android.
    /// </summary>
    public sealed class SetVisibleSizeCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setVisibleSize";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Frame width (DIP).
        /// </summary>
        [JsonProperty("width")]
        public long Width
        {
            get;
            set;
        }
        /// <summary>
        /// Frame height (DIP).
        /// </summary>
        [JsonProperty("height")]
        public long Height
        {
            get;
            set;
        }
    }

    public sealed class SetVisibleSizeCommandResponse : ICommandResponse<SetVisibleSizeCommandSettings>
    {
    }
}