namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when a new window is going to be opened, via window.open(), link click, form submission,
    /// etc.
    /// </summary>
    public sealed class WindowOpenEventArgs : EventArgs
    {
        /// <summary>
        /// The URL for the new window.
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Window name.
        /// </summary>
        [JsonProperty("windowName")]
        public string WindowName
        {
            get;
            set;
        }
        /// <summary>
        /// An array of enabled window features.
        /// </summary>
        [JsonProperty("windowFeatures")]
        public string[] WindowFeatures
        {
            get;
            set;
        }
        /// <summary>
        /// Whether or not it was triggered by user gesture.
        /// </summary>
        [JsonProperty("userGesture")]
        public bool UserGesture
        {
            get;
            set;
        }
    }
}