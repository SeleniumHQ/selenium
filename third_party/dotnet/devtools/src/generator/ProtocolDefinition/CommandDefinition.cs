namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    using Newtonsoft.Json;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;

    public sealed class CommandDefinition : ProtocolDefinitionItem
    {
        public CommandDefinition()
        {
            Handlers = new HashSet<string>();

            Parameters = new Collection<TypeDefinition>();
            Returns = new Collection<TypeDefinition>();
        }

        [JsonProperty(PropertyName = "handlers")]
        public ICollection<string> Handlers
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "parameters")]
        public ICollection<TypeDefinition> Parameters
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "returns")]
        public ICollection<TypeDefinition> Returns
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "redirect")]
        public string Redirect
        {
            get;
            set;
        }

        [JsonIgnore]
        public bool NoParameters => Parameters == null || Parameters.Count == 0;
    }
}
