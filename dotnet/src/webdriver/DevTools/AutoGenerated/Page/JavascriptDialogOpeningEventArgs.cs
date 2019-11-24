namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) is about to
    /// open.
    /// </summary>
    public sealed class JavascriptDialogOpeningEventArgs : EventArgs
    {
        /// <summary>
        /// Frame url.
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Message that will be displayed by the dialog.
        /// </summary>
        [JsonProperty("message")]
        public string Message
        {
            get;
            set;
        }
        /// <summary>
        /// Dialog type.
        /// </summary>
        [JsonProperty("type")]
        public DialogType Type
        {
            get;
            set;
        }
        /// <summary>
        /// True iff browser is capable showing or acting on the given dialog. When browser has no
        /// dialog handler for given target, calling alert while Page domain is engaged will stall
        /// the page execution. Execution can be resumed via calling Page.handleJavaScriptDialog.
        /// </summary>
        [JsonProperty("hasBrowserHandler")]
        public bool HasBrowserHandler
        {
            get;
            set;
        }
        /// <summary>
        /// Default dialog prompt.
        /// </summary>
        [JsonProperty("defaultPrompt", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string DefaultPrompt
        {
            get;
            set;
        }
    }
}