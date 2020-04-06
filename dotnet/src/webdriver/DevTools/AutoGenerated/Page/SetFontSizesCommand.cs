namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Set default font sizes.
    /// </summary>
    public sealed class SetFontSizesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.setFontSizes";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Specifies font sizes to set. If a font size is not specified, it won't be changed.
        /// </summary>
        [JsonProperty("fontSizes")]
        public FontSizes FontSizes
        {
            get;
            set;
        }
    }

    public sealed class SetFontSizesCommandResponse : ICommandResponse<SetFontSizesCommandSettings>
    {
    }
}