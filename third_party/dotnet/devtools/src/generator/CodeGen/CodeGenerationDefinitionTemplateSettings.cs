using System.Text.Json.Serialization;

namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Represents settings around Definition templates.
    /// </summary>
    public class CodeGenerationDefinitionTemplateSettings
    {
        [JsonPropertyName("domainTemplate")]
        public CodeGenerationTemplateSettings DomainTemplate { get; set; } = new CodeGenerationTemplateSettings
        {
            TemplatePath = "domain.hbs",
            OutputPath = "{{domainName}}\\{{className}}Adapter.cs",
        };

        [JsonPropertyName("commandTemplate")]
        public CodeGenerationTemplateSettings CommandTemplate { get; set; } = new CodeGenerationTemplateSettings
        {
            TemplatePath = "command.hbs",
            OutputPath = "{{domainName}}\\{{className}}Command.cs",
        };

        [JsonPropertyName("eventTemplate")]
        public CodeGenerationTemplateSettings EventTemplate { get; set; } = new CodeGenerationTemplateSettings
        {
            TemplatePath = "event.hbs",
            OutputPath = "{{domainName}}\\{{className}}EventArgs.cs",
        };

        [JsonPropertyName("typeObjectTemplate")]
        public CodeGenerationTemplateSettings TypeObjectTemplate { get; set; } = new CodeGenerationTemplateSettings
        {
            TemplatePath = "type-object.hbs",
            OutputPath = "{{domainName}}\\{{className}}.cs",
        };


        [JsonPropertyName("typeHashTemplate")]
        public CodeGenerationTemplateSettings TypeHashTemplate { get; set; } = new CodeGenerationTemplateSettings
        {
            TemplatePath = "type-hash.hbs",
            OutputPath = "{{domainName}}\\{{className}}.cs",
        };

        [JsonPropertyName("typeEnumTemplate")]
        public CodeGenerationTemplateSettings TypeEnumTemplate { get; set; } = new CodeGenerationTemplateSettings
        {
            TemplatePath = "type-enum.hbs",
            OutputPath = "{{domainName}}{{separator}}{{className}}.cs",
        };
    }
}
