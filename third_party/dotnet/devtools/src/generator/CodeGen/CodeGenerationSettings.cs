using System.Text.Json.Serialization;
using System.Collections.Generic;

namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Settings to be passed to a ICodeGenerator
    /// </summary>
    public sealed class CodeGenerationSettings
    {
        /// <summary>
        /// Collection of templates that will be parsed and output in the target folder.
        /// </summary>
        [JsonPropertyName("include")]
        public ICollection<CodeGenerationTemplateSettings> Include { get; set; } = new List<CodeGenerationTemplateSettings>();

        /// <summary>
        /// Indicates whether or not domains marked as depreciated will be generated. (Default: true)
        /// </summary>
        [JsonPropertyName("includeDeprecatedDomains")]
        public bool IncludeDeprecatedDomains { get; set; } = true;

        /// <summary>
        /// Indicates whether or not domains marked as depreciated will be generated. (Default: true)
        /// </summary>
        [JsonPropertyName("includeExperimentalDomains")]
        public bool IncludeExperimentalDomains { get; set; } = true;

        /// <summary>
        /// Gets or sets the root namespace of generated classes.
        /// </summary>
        [JsonPropertyName("rootNamespace")]
        public string RootNamespace { get; set; } = "BaristaLabs.ChromeDevTools";

        /// <summary>
        /// Gets the version number of the runtime.
        /// </summary>
        [JsonPropertyName("runtimeVersion")]
        public string? RuntimeVersion { get; set; }

        [JsonPropertyName("definitionTemplates")]
        public CodeGenerationDefinitionTemplateSettings DefinitionTemplates { get; set; } = new CodeGenerationDefinitionTemplateSettings();

        [JsonPropertyName("templatesPath")]
        public string TemplatesPath { get; set; } = "Templates";

        /// <summary>
        /// The using statements that will be included on each generated file.
        /// </summary>
        [JsonPropertyName("usingStatements")]
        public ICollection<string> UsingStatements { get; set; } = new List<string>()
        {
            "System"
        };
    }
}
