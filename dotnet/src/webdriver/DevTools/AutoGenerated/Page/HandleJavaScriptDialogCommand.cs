namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Accepts or dismisses a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload).
    /// </summary>
    public sealed class HandleJavaScriptDialogCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.handleJavaScriptDialog";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Whether to accept or dismiss the dialog.
        /// </summary>
        [JsonProperty("accept")]
        public bool Accept
        {
            get;
            set;
        }
        /// <summary>
        /// The text to enter into the dialog prompt before accepting. Used only if this is a prompt
        /// dialog.
        /// </summary>
        [JsonProperty("promptText", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string PromptText
        {
            get;
            set;
        }
    }

    public sealed class HandleJavaScriptDialogCommandResponse : ICommandResponse<HandleJavaScriptDialogCommandSettings>
    {
    }
}