namespace OpenQA.Selenium.DevTools.DOM
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Called when a pseudo element is added to an element.
    /// </summary>
    public sealed class PseudoElementAddedEventArgs : EventArgs
    {
        /// <summary>
        /// Pseudo element's parent element id.
        /// </summary>
        [JsonProperty("parentId")]
        public long ParentId
        {
            get;
            set;
        }
        /// <summary>
        /// The added pseudo element.
        /// </summary>
        [JsonProperty("pseudoElement")]
        public Node PseudoElement
        {
            get;
            set;
        }
    }
}