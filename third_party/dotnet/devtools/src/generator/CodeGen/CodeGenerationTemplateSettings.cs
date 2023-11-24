namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    using Newtonsoft.Json;

    /// <summary>
    /// Defines settings around templates
    /// </summary>
    public class CodeGenerationTemplateSettings
    {
        [JsonProperty("templatePath")]
        public string TemplatePath
        {
            get;
            set;
        }

        [JsonProperty("outputPath")]
        public string OutputPath
        {
            get;
            set;
        }
    }
}
