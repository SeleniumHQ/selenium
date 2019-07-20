namespace OpenQA.Selenium.DevTools.DOM
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Called when shadow root is popped from the element.
    /// </summary>
    public sealed class ShadowRootPoppedEventArgs : EventArgs
    {
        /// <summary>
        /// Host element id.
        /// </summary>
        [JsonProperty("hostId")]
        public long HostId
        {
            get;
            set;
        }
        /// <summary>
        /// Shadow root id.
        /// </summary>
        [JsonProperty("rootId")]
        public long RootId
        {
            get;
            set;
        }
    }
}