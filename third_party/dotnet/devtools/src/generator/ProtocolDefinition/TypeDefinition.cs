namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    using Newtonsoft.Json;
    using OpenQA.Selenium.DevToolsGenerator.Converters;
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;

    public sealed class TypeDefinition : ProtocolDefinitionItem
    {
        public TypeDefinition()
        {
            Enum = new HashSet<string>();
            Properties = new Collection<TypeDefinition>();
        }

        [JsonProperty(PropertyName = "id")]
        public string Id
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "type")]
        public string Type
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "enum")]
        public ICollection<string> Enum
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "properties")]
        public ICollection<TypeDefinition> Properties
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "items")]
        public TypeDefinition Items
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "minItems")]
        public int MinItems
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "maxItems")]
        public int MaxItems
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "$ref")]
        public string TypeReference
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "optional")]
        [JsonConverter(typeof(BooleanJsonConverter))]
        public bool Optional
        {
            get;
            set;
        }

        public override string ToString()
        {
            if (!String.IsNullOrWhiteSpace(Id))
                return Id;

            if (!String.IsNullOrWhiteSpace(Name))
                return Name;

            return $"Ref: {TypeReference}";
        }
    }
}
