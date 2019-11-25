namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when a renderer-initiated navigation is requested.
    /// Navigation may still be cancelled after the event is issued.
    /// </summary>
    public sealed class FrameRequestedNavigationEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the frame that is being navigated.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
        /// <summary>
        /// The reason for the navigation.
        /// </summary>
        [JsonProperty("reason")]
        public ClientNavigationReason Reason
        {
            get;
            set;
        }
        /// <summary>
        /// The destination URL for the requested navigation.
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
    }
}