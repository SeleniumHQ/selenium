namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    using Humanizer;
    using Microsoft.Extensions.DependencyInjection;
    using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
    using System;
    using System.Collections.Generic;
    using System.Linq;

    /// <summary>
    /// Generates code for Domain Definitions
    /// </summary>
    public sealed class DomainGenerator : CodeGeneratorBase<DomainDefinition>
    {
        public DomainGenerator(IServiceProvider serviceProvider)
            : base(serviceProvider)
        {
        }

        public override IDictionary<string, string> GenerateCode(DomainDefinition domainDefinition, CodeGeneratorContext context)
        {
            var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            var typeGenerator = ServiceProvider.GetRequiredService<ICodeGenerator<TypeDefinition>>();
            foreach (var type in domainDefinition.Types)
            {
                typeGenerator.GenerateCode(type, context)
                    .ToList()
                    .ForEach(x => result.Add(x.Key, x.Value));
            }

            var eventGenerator = ServiceProvider.GetRequiredService<ICodeGenerator<EventDefinition>>();
            foreach (var @event in domainDefinition.Events)
            {
                eventGenerator.GenerateCode(@event, context)
                    .ToList()
                    .ForEach(x => result.Add(x.Key, x.Value));
            }

            var commandGenerator = ServiceProvider.GetRequiredService<ICodeGenerator<CommandDefinition>>();
            foreach (var command in domainDefinition.Commands)
            {
                commandGenerator.GenerateCode(command, context)
                    .ToList()
                    .ForEach(x => result.Add(x.Key, x.Value));
            }

            if (String.IsNullOrWhiteSpace(Settings.DefinitionTemplates.DomainTemplate.TemplatePath))
                return result;

            var domainGenerator = TemplatesManager.GetGeneratorForTemplate(Settings.DefinitionTemplates.DomainTemplate);

            var className = domainDefinition.Name.Dehumanize();

            string codeResult = domainGenerator(new
            {
                domain = domainDefinition,
                className = className,
                rootNamespace = Settings.RootNamespace,
                context = context
            });

            var outputPath = Utility.ReplaceTokensInPath(Settings.DefinitionTemplates.DomainTemplate.OutputPath, className, context, Settings);
            result.Add(outputPath, codeResult);

            return result;
        }
    }
}
