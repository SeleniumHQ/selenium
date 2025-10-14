using System.Text.Json.Serialization;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    public sealed class EventDefinition : ProtocolDefinitionItem
    {
        [JsonPropertyName("parameters")]
        public ICollection<TypeDefinition> Parameters { get; set; } = new Collection<TypeDefinition>();
    }
}
