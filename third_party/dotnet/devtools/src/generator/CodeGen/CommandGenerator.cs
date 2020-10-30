namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    using Humanizer;
    using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
    using System;
    using System.Collections.Generic;

    /// <summary>
    /// Generates code for Command Definitions
    /// </summary>
    public sealed class CommandGenerator : CodeGeneratorBase<CommandDefinition>
    {
        public CommandGenerator(IServiceProvider serviceProvider)
            : base(serviceProvider)
        {
        }

        public override IDictionary<string, string> GenerateCode(CommandDefinition commandDefinition, CodeGeneratorContext context)
        {
            var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            if (String.IsNullOrWhiteSpace(Settings.DefinitionTemplates.CommandTemplate.TemplatePath))
                return result;

            var commandGenerator = TemplatesManager.GetGeneratorForTemplate(Settings.DefinitionTemplates.CommandTemplate);

            var className = commandDefinition.Name.Dehumanize();
            string codeResult = commandGenerator(new
            {
                command = commandDefinition,
                className = className,
                domain = context.Domain,
                rootNamespace = Settings.RootNamespace,
                context = context
            });

            var outputPath = Utility.ReplaceTokensInPath(Settings.DefinitionTemplates.CommandTemplate.OutputPath, className, context, Settings);
            result.Add(outputPath, codeResult);
            return result;
        }
    }
}
