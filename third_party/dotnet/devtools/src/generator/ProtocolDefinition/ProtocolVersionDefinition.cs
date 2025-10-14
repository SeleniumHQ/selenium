using System.Text.Json.Serialization;
using System;
using System.Text.RegularExpressions;

namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    /// <summary>
    /// Represents the browser version information retrieved from a Chromium-based browser.
    /// </summary>
    public class ProtocolVersionDefinition
    {
        [JsonPropertyName("Browser")]
        public string? Browser { get; set; }

        [JsonPropertyName("Protocol-Version")]
        public string? ProtocolVersion { get; set; }

        [JsonPropertyName("User-Agent")]
        public string? UserAgent { get; set; }

        [JsonPropertyName("V8-Version")]
        public string? V8Version { get; set; }

        [JsonPropertyName("WebKit-Version")]
        public string? WebKitVersion { get; set; }
    }
}
