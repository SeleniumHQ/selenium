namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when frame schedules a potential navigation.
    /// </summary>
    public sealed class FrameScheduledNavigationEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the frame that has scheduled a navigation.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
        /// <summary>
        /// Delay (in seconds) until the navigation is scheduled to begin. The navigation is not
        /// guaranteed to start.
        /// </summary>
        [JsonProperty("delay")]
        public double Delay
        {
            get;
            set;
        }
        /// <summary>
        /// The reason for the navigation.
        /// </summary>
        [JsonProperty("reason")]
        public string Reason
        {
            get;
            set;
        }
        /// <summary>
        /// The destination URL for the scheduled navigation.
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
    }
}