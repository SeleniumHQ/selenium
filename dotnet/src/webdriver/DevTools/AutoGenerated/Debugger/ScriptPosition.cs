namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Location in the source code.
    /// </summary>
    public sealed class ScriptPosition
    {
        /// <summary>
        /// lineNumber
        ///</summary>
        [JsonProperty("lineNumber")]
        public long LineNumber
        {
            get;
            set;
        }
        /// <summary>
        /// columnNumber
        ///</summary>
        [JsonProperty("columnNumber")]
        public long ColumnNumber
        {
            get;
            set;
        }
    }
}