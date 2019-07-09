namespace OpenQA.Selenium.DevTools.DOM
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Mirrors `DOMCharacterDataModified` event.
    /// </summary>
    public sealed class CharacterDataModifiedEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the node that has changed.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// New text value.
        /// </summary>
        [JsonProperty("characterData")]
        public string CharacterData
        {
            get;
            set;
        }
    }
}