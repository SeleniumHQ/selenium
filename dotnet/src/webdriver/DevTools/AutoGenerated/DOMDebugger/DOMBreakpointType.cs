namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// DOM breakpoint type.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum DOMBreakpointType
    {
        [EnumMember(Value = "subtree-modified")]
        SubtreeModified,
        [EnumMember(Value = "attribute-modified")]
        AttributeModified,
        [EnumMember(Value = "node-removed")]
        NodeRemoved,
    }
}