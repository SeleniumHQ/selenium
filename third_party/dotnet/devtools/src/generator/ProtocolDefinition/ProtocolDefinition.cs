using System.Text.Json.Serialization;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    public sealed class ProtocolDefinition : IDefinition
    {
        [JsonPropertyName("browserVersion")]
        [JsonRequired]
        public ProtocolVersionDefinition? BrowserVersion { get; set; }

        [JsonPropertyName("version")]
        [JsonRequired]
        public Version? Version { get; set; }

        [JsonPropertyName("domains")]
        [JsonRequired]
        public ICollection<DomainDefinition> Domains { get; set; } = new Collection<DomainDefinition>();
    }
}
