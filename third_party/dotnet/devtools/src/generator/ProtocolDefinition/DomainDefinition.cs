using System.Text.Json.Serialization;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    public sealed class DomainDefinition : ProtocolDefinitionItem
    {
        [JsonPropertyName("domain")]
        public override string? Name { get; set; }

        [JsonPropertyName("types")]
        public ICollection<TypeDefinition> Types { get; set; } = new Collection<TypeDefinition>();

        [JsonPropertyName("commands")]
        public ICollection<CommandDefinition> Commands { get; set; } = new Collection<CommandDefinition>();

        [JsonPropertyName("events")]
        public ICollection<EventDefinition> Events { get; set; } = new Collection<EventDefinition>();

        [JsonPropertyName("dependencies")]
        public ICollection<string> Dependencies { get; set; } = new HashSet<string>();
    }
}
