namespace OpenQA.Selenium.DevTools.Input
{
    using Newtonsoft.Json;

    /// <summary>
    /// This method emulates inserting text that doesn't come from a key press,
    /// for example an emoji keyboard or an IME.
    /// </summary>
    public sealed class InsertTextCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Input.insertText";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// The text to insert.
        /// </summary>
        [JsonProperty("text")]
        public string Text
        {
            get;
            set;
        }
    }

    public sealed class InsertTextCommandResponse : ICommandResponse<InsertTextCommandSettings>
    {
    }
}