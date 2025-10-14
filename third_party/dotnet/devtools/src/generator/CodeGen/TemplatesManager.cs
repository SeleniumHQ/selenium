using HandlebarsDotNet;
using System;
using System.Collections.Generic;
using System.IO;
using Humanizer;
using System.Linq;
using System.Text;
using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;

namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Represents a class that manages templates and their associated generators.
    /// </summary>
    public sealed class TemplatesManager
    {
        private readonly Dictionary<string, Func<object, string>> m_templateGenerators = new Dictionary<string, Func<object, string>>(StringComparer.OrdinalIgnoreCase);

        /// <summary>
        /// Gets the code generation settings associated with the protocol generator
        /// </summary>
        public CodeGenerationSettings Settings { get; }

        public TemplatesManager(CodeGenerationSettings settings)
        {
            Settings = settings ?? throw new ArgumentNullException(nameof(settings));
        }

        /// <summary>
        /// Returns a generator singleton for the specified template settings.
        /// </summary>
        /// <param name="templateSettings">The settings for a generator.</param>
        /// <returns></returns>
        public Func<object, string> GetGeneratorForTemplate(CodeGenerationTemplateSettings templateSettings)
        {
            var templatePath = templateSettings.TemplatePath;
            if (m_templateGenerators.TryGetValue(templatePath, out Func<object, string>? value))
            {
                return value;
            }

            var targetTemplate = templatePath;
            if (!Path.IsPathRooted(targetTemplate))
            {
                targetTemplate = Path.Combine(Settings.TemplatesPath, targetTemplate);
            }

            if (!File.Exists(targetTemplate))
            {
                throw new FileNotFoundException($"Unable to locate a template at {targetTemplate} - please ensure that a template file exists at this location.", targetTemplate);
            }

            var templateContents = File.ReadAllText(targetTemplate);

            Handlebars.RegisterHelper("dehumanize", (writer, context, arguments) =>
            {
                if (arguments.Length != 1)
                {
                    throw new HandlebarsException("{{humanize}} helper must have exactly one argument");
                }

                var str = arguments[0].ToString()!;

                //Some overrides for values that start with '-' -- this fixes two instances in Runtime.UnserializableValue
                if (str.StartsWith("-"))
                {
                    str = $"Negative{str.Dehumanize()}";
                }
                else
                {
                    str = str.Dehumanize();
                }

                writer.WriteSafeString(str.Dehumanize());
            });

            Handlebars.RegisterHelper("xml-code-comment", (writer, context, arguments) =>
            {
                if (arguments.Length < 1)
                {
                    throw new HandlebarsException("{{code-comment}} helper must have at least one argument");
                }

                var str = arguments[0] == null ? "" : arguments[0].ToString();

                if (string.IsNullOrWhiteSpace(str))
                {
                    switch (context)
                    {
                        case ProtocolDefinitionItem pdi:
                            str = $"{pdi.Name}";
                            break;
                        default:
                            str = context.className;
                            break;
                    }
                }

                var frontPaddingObj = arguments.ElementAtOrDefault(1);
                var frontPadding = 1;
                if (frontPaddingObj != null)
                {
                    int.TryParse(frontPaddingObj.ToString(), out frontPadding);
                }

                str = Utility.ReplaceLineEndings(str, Environment.NewLine + new StringBuilder(4 * frontPadding).Insert(0, "    ", frontPadding) + "/// ");

                writer.WriteSafeString(str);
            });

            Handlebars.RegisterHelper("typemap", (writer, context, arguments) =>
            {
                if (context is not TypeDefinition typeDefinition)
                {
                    throw new HandlebarsException("{{typemap}} helper expects to be in the context of a TypeDefinition.");
                }

                if (arguments.Length != 1)
                {
                    throw new HandlebarsException("{{typemap}} helper expects exactly one argument - the CodeGeneratorContext.");
                }

                if (arguments[0] is not CodeGeneratorContext codeGenContext)
                {
                    throw new InvalidOperationException("Expected context argument to be non-null.");
                }

                var mappedType = Utility.GetTypeMappingForType(typeDefinition, codeGenContext.Domain, codeGenContext.KnownTypes);
                writer.WriteSafeString(mappedType);
            });

            Handlebars.Configuration.TextEncoder = null;
            return Handlebars.Compile(templateContents);
        }
    }
}
