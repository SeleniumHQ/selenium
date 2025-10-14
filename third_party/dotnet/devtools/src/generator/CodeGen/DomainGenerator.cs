using Humanizer;
using Microsoft.Extensions.DependencyInjection;
using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
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
            foreach (TypeDefinition type in domainDefinition.Types)
            {
                foreach (KeyValuePair<string, string> x in typeGenerator.GenerateCode(type, context))
                {
                    result.Add(x.Key, x.Value);
                }
            }

            var eventGenerator = ServiceProvider.GetRequiredService<ICodeGenerator<EventDefinition>>();
            foreach (EventDefinition @event in domainDefinition.Events)
            {
                foreach (KeyValuePair<string, string> x in eventGenerator.GenerateCode(@event, context))
                {
                    result.Add(x.Key, x.Value);
                }
            }

            var commandGenerator = ServiceProvider.GetRequiredService<ICodeGenerator<CommandDefinition>>();
            foreach (CommandDefinition command in domainDefinition.Commands)
            {
                foreach (KeyValuePair<string, string> x in commandGenerator.GenerateCode(command, context))
                {
                    result.Add(x.Key, x.Value);
                }
            }

            if (string.IsNullOrWhiteSpace(Settings.DefinitionTemplates.DomainTemplate.TemplatePath))
            {
                return result;
            }

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
