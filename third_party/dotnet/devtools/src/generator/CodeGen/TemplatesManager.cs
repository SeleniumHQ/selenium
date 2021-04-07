namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    using HandlebarsDotNet;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using Humanizer;
    using System.Linq;
    using System.Text;
    using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;

    /// <summary>
    /// Represents a class that manages templates and their associated generators.
    /// </summary>
    public sealed class TemplatesManager
    {
        private readonly IDictionary<string, Func<object, string>> m_templateGenerators = new Dictionary<string, Func<object, string>>(StringComparer.OrdinalIgnoreCase);
        private readonly CodeGenerationSettings m_settings;

        /// <summary>
        /// Gets the code generation settings associated with the protocol generator
        /// </summary>
        public CodeGenerationSettings Settings
        {
            get { return m_settings; }
        }

        public TemplatesManager(CodeGenerationSettings settings)
        {
            m_settings = settings ?? throw new ArgumentNullException(nameof(settings));
        }

        /// <summary>
        /// Returns a generator singleton for the specified template path.
        /// </summary>
        /// <param name="templatePath"></param>
        /// <returns></returns>
        public Func<object, string> GetGeneratorForTemplate(CodeGenerationTemplateSettings templateSettings)
        {
            var templatePath = templateSettings.TemplatePath;
            if (m_templateGenerators.ContainsKey(templatePath))
                return m_templateGenerators[templatePath];

            var targetTemplate = templatePath;
            if (!Path.IsPathRooted(targetTemplate))
                targetTemplate = Path.Combine(Settings.TemplatesPath, targetTemplate);

            if (!File.Exists(targetTemplate))
                throw new FileNotFoundException($"Unable to locate a template at {targetTemplate} - please ensure that a template file exists at this location.");

            var templateContents = File.ReadAllText(targetTemplate);

            Handlebars.RegisterHelper("dehumanize", (writer, context, arguments) =>
            {
                if (arguments.Length != 1)
                {
                    throw new HandlebarsException("{{humanize}} helper must have exactly one argument");
                }

                var str = arguments[0].ToString();

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

                if (String.IsNullOrWhiteSpace(str))
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
                var typeDefinition = context as TypeDefinition;
                if (typeDefinition == null)
                {
                    throw new HandlebarsException("{{typemap}} helper expects to be in the context of a TypeDefinition.");
                }

                if (arguments.Length != 1)
                {
                    throw new HandlebarsException("{{typemap}} helper expects exactly one argument - the CodeGeneratorContext.");
                }

                var codeGenContext = arguments[0] as CodeGeneratorContext;
                if (codeGenContext == null)
                    throw new InvalidOperationException("Expected context argument to be non-null.");

                var mappedType = Utility.GetTypeMappingForType(typeDefinition, codeGenContext.Domain, codeGenContext.KnownTypes);
                writer.WriteSafeString(mappedType);
            });

            Handlebars.Configuration.TextEncoder = null;
            return Handlebars.Compile(templateContents);
        }
    }
}
