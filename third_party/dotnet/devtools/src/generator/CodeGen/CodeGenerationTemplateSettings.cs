using System.Text.Json.Serialization;

namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Defines settings around templates
    /// </summary>
    public class CodeGenerationTemplateSettings
    {
        [JsonPropertyName("templatePath")]
        [JsonRequired]
        public string TemplatePath { get; set; } = null!;

        [JsonPropertyName("outputPath")]
        [JsonRequired]
        public string OutputPath { get; set; } = null!;
    }
}
