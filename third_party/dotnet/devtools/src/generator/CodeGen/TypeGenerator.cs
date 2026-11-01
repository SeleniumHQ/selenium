using Humanizer;
using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Generates code for Type Definitions
    /// </summary>
    public sealed class TypeGenerator : CodeGeneratorBase<TypeDefinition>
    {
        public TypeGenerator(IServiceProvider serviceProvider)
            : base(serviceProvider)
        {
        }

        public override IDictionary<string, string> GenerateCode(TypeDefinition typeDefinition, CodeGeneratorContext context)
        {
            var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            if (context.KnownTypes == null)
            {
                throw new InvalidOperationException("Expected knowntypes to be specified in context");
            }

            if (context.Domain == null)
            {
                throw new InvalidOperationException("Expected domain to be specified in context");
            }

            var typeInfo = context.KnownTypes[$"{context.Domain.Name}.{typeDefinition.Id}"];
            if (typeInfo.IsPrimitive)
            {
                return result;
            }

            //Base the code generation template on the specified type definition type.
            CodeGenerationTemplateSettings templateSettings;
            switch (typeDefinition.Type)
            {
                case "object":
                    templateSettings = Settings.DefinitionTemplates.TypeObjectTemplate;
                    break;
                case "string":
                    templateSettings = Settings.DefinitionTemplates.TypeEnumTemplate;
                    break;
                default:
                    throw new InvalidOperationException($"Unsupported Type Definition Type: {typeDefinition.Type}");
            }

            // Special override for the headers object to be an open object.
            // TODO: make this kind of override configurable.
            if (context.Domain.Name == "Network" && typeDefinition.Id == "Headers")
            {
                templateSettings = Settings.DefinitionTemplates.TypeHashTemplate;
            }

            if (string.IsNullOrWhiteSpace(templateSettings.TemplatePath))
            {
                return result;
            }

            var typeGenerator = TemplatesManager.GetGeneratorForTemplate(templateSettings);

            var className = typeDefinition.Id.Dehumanize();
            var codeResult = typeGenerator(new
            {
                type = typeDefinition,
                className = className,
                domain = context.Domain,
                rootNamespace = Settings.RootNamespace,
                context = context,
                enumValues = typeDefinition.Enum.Select(value => new
                {
                    Name = GetEnumMemberName(value),
                    WireValueLiteral = JsonSerializer.Serialize(value)
                }).ToList(),
                enumReadValues = GetEnumReadValues(typeDefinition)
            });

            var outputPath = Utility.ReplaceTokensInPath(templateSettings.OutputPath, className, context, Settings);
            result.Add(outputPath, codeResult);
            return result;
        }

        private static string GetEnumMemberName(string value)
        {
            string name = value.StartsWith("-", StringComparison.Ordinal)
                ? $"Negative{value.Dehumanize()}"
                : value.Dehumanize();
            return name.Dehumanize();
        }

        private static List<object> GetEnumReadValues(TypeDefinition typeDefinition)
        {
            var enumReadValues = new Dictionary<string, string>(StringComparer.Ordinal);
            var enumValues = typeDefinition.Enum
                .Select(value => (Value: value, Name: GetEnumMemberName(value)))
                .ToList();

            foreach (var enumValue in enumValues)
            {
                enumReadValues.Add(enumValue.Name, enumValue.Name);
            }

            foreach (var enumValue in enumValues)
            {
                enumReadValues[enumValue.Value] = enumValue.Name;
            }

            return enumReadValues
                .Select(pair => new
                {
                    ValueLiteral = JsonSerializer.Serialize(pair.Key),
                    Name = pair.Value
                })
                .Cast<object>()
                .ToList();
        }
    }
}
