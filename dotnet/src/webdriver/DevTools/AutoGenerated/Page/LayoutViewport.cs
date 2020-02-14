namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Layout viewport position and dimensions.
    /// </summary>
    public sealed class LayoutViewport
    {
        /// <summary>
        /// Horizontal offset relative to the document (CSS pixels).
        ///</summary>
        [JsonProperty("pageX")]
        public long PageX
        {
            get;
            set;
        }
        /// <summary>
        /// Vertical offset relative to the document (CSS pixels).
        ///</summary>
        [JsonProperty("pageY")]
        public long PageY
        {
            get;
            set;
        }
        /// <summary>
        /// Width (CSS pixels), excludes scrollbar if present.
        ///</summary>
        [JsonProperty("clientWidth")]
        public long ClientWidth
        {
            get;
            set;
        }
        /// <summary>
        /// Height (CSS pixels), excludes scrollbar if present.
        ///</summary>
        [JsonProperty("clientHeight")]
        public long ClientHeight
        {
            get;
            set;
        }
    }
}