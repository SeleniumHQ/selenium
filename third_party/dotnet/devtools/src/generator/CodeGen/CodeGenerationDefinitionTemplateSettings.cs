namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    using Newtonsoft.Json;

    /// <summary>
    /// Represents settings around Definition templates.
    /// </summary>
    public class CodeGenerationDefinitionTemplateSettings
    {
        public CodeGenerationDefinitionTemplateSettings()
        {
            //Set Defaults;
            DomainTemplate = new CodeGenerationTemplateSettings
            {
                TemplatePath = "domain.hbs",
                OutputPath = "{{domainName}}\\{{className}}Adapter.cs",
            };

            CommandTemplate = new CodeGenerationTemplateSettings {
                TemplatePath = "command.hbs",
                OutputPath = "{{domainName}}\\{{className}}Command.cs",
            };

            EventTemplate = new CodeGenerationTemplateSettings
            {
                TemplatePath = "event.hbs",
                OutputPath = "{{domainName}}\\{{className}}EventArgs.cs",
            };

            TypeObjectTemplate = new CodeGenerationTemplateSettings
            {
                TemplatePath = "type-object.hbs",
                OutputPath = "{{domainName}}\\{{className}}.cs",
            };

            TypeHashTemplate = new CodeGenerationTemplateSettings
            {
                TemplatePath = "type-hash.hbs",
                OutputPath = "{{domainName}}\\{{className}}.cs",
            };

            TypeEnumTemplate = new CodeGenerationTemplateSettings
            {
                TemplatePath = "type-enum.hbs",
                OutputPath = "{{domainName}}\\{{className}}.cs",
            };
        }

        [JsonProperty("domainTemplate")]
        public CodeGenerationTemplateSettings DomainTemplate
        {
            get;
            set;
        }

        [JsonProperty("commandTemplate")]
        public CodeGenerationTemplateSettings CommandTemplate
        {
            get;
            set;
        }

        [JsonProperty("eventTemplate")]
        public CodeGenerationTemplateSettings EventTemplate
        {
            get;
            set;
        }

        [JsonProperty("typeObjectTemplate")]
        public CodeGenerationTemplateSettings TypeObjectTemplate
        {
            get;
            set;
        }

        [JsonProperty("typeHashTemplate")]
        public CodeGenerationTemplateSettings TypeHashTemplate
        {
            get;
            set;
        }

        [JsonProperty("typeEnumTemplate")]
        public CodeGenerationTemplateSettings TypeEnumTemplate
        {
            get;
            set;
        }

    }
}
