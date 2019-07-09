namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when the page with currently enabled screencast was shown or hidden `.
    /// </summary>
    public sealed class ScreencastVisibilityChangedEventArgs : EventArgs
    {
        /// <summary>
        /// True if the page is visible.
        /// </summary>
        [JsonProperty("visible")]
        public bool Visible
        {
            get;
            set;
        }
    }
}