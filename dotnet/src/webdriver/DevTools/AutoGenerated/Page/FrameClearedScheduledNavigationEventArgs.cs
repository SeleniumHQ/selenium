namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when frame no longer has a scheduled navigation.
    /// </summary>
    public sealed class FrameClearedScheduledNavigationEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the frame that has cleared its scheduled navigation.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
    }
}