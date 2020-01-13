namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Set generic font families.
    /// </summary>
    public sealed class SetFontFamiliesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.setFontFamilies";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Specifies font families to set. If a font family is not specified, it won't be changed.
        /// </summary>
        [JsonProperty("fontFamilies")]
        public FontFamilies FontFamilies
        {
            get;
            set;
        }
    }

    public sealed class SetFontFamiliesCommandResponse : ICommandResponse<SetFontFamiliesCommandSettings>
    {
    }
}