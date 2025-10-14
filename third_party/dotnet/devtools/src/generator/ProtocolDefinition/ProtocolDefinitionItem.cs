using System.Text.Json.Serialization;
using OpenQA.Selenium.DevToolsGenerator.Converters;

namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    public abstract class ProtocolDefinitionItem : IDefinition
    {

        [JsonPropertyName("deprecated")]
        public bool Deprecated { get; set; }

        public string? Description
        {
            get => InitialDescription?.Replace("<", "&lt;").Replace(">", "&gt;");
            set => InitialDescription = value;
        }

        [JsonPropertyName("experimental")]
        [JsonConverter(typeof(BooleanJsonConverter))]
        public bool Experimental { get; set; }

        [JsonPropertyName("name")]
        public virtual string? Name { get; set; }

        public override string? ToString()
        {
            return Name;
        }

        [JsonPropertyName("description")]
        protected string? InitialDescription { get; set; }
    }
}
