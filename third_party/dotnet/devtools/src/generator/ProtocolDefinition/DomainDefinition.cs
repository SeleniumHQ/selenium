namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    using Newtonsoft.Json;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;

    public sealed class DomainDefinition : ProtocolDefinitionItem
    {
        public DomainDefinition()
        {
            Dependencies = new HashSet<string>();

            Types = new Collection<TypeDefinition>();
            Events = new Collection<EventDefinition>();
            Commands = new Collection<CommandDefinition>();
        }

        [JsonProperty(PropertyName = "domain")]
        public override string Name
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "types")]
        public ICollection<TypeDefinition> Types
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "commands")]
        public ICollection<CommandDefinition> Commands
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "events")]
        public ICollection<EventDefinition> Events
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "dependencies")]
        public ICollection<string> Dependencies
        {
            get;
            set;
        }
    }
}
