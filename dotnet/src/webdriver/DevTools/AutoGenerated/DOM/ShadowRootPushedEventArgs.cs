namespace OpenQA.Selenium.DevTools.DOM
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Called when shadow root is pushed into the element.
    /// </summary>
    public sealed class ShadowRootPushedEventArgs : EventArgs
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
        /// Shadow root.
        /// </summary>
        [JsonProperty("root")]
        public Node Root
        {
            get;
            set;
        }
    }
}