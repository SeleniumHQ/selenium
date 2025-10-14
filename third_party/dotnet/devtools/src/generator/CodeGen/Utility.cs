using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Contains various utility methods.
    /// </summary>
    public static partial class Utility
    {
        /// <summary>
        /// Replaces tokens in the target path.
        /// </summary>
        /// <param name="path"></param>
        /// <param name="className"></param>
        /// <param name="context"></param>
        /// <param name="settings"></param>
        /// <returns></returns>
        public static string ReplaceTokensInPath(string path, string className, CodeGeneratorContext context, CodeGenerationSettings settings)
        {
            path = path.Replace("{{className}}", className);
            path = path.Replace("{{rootNamespace}}", settings.RootNamespace);
            path = path.Replace("{{templatePath}}", settings.TemplatesPath);
            path = path.Replace("{{domainName}}", context.Domain.Name);
            path = path.Replace('\\', System.IO.Path.DirectorySeparatorChar);
            path = path.Replace("{{separator}}", System.IO.Path.DirectorySeparatorChar.ToString());
            return path;
        }

        /// <summary>
        /// For the given type, gets the associated type mapping given the domain and known types.
        /// </summary>
        /// <param name="typeDefinition"></param>
        /// <param name="domainDefinition"></param>
        /// <param name="knownTypes"></param>
        /// <param name="isArray"></param>
        /// <returns></returns>
        public static string GetTypeMappingForType(TypeDefinition typeDefinition, DomainDefinition domainDefinition, IDictionary<string, TypeInfo> knownTypes, bool isArray = false)
        {
            if (typeDefinition is null)
            {
                throw new ArgumentNullException(nameof(typeDefinition));
            }

            var type = typeDefinition.Type;

            if (string.IsNullOrWhiteSpace(type))
            {
                type = typeDefinition.TypeReference ?? throw new ArgumentException("Type definition has neither Type or TypeReference", nameof(typeDefinition));
            }

            string mappedType;
            if (type.Contains(".") && knownTypes.TryGetValue(type, out TypeInfo? typeInfo))
            {
                if (typeInfo.IsPrimitive)
                {
                    var primitiveType = typeInfo.TypeName;

                    if (typeDefinition.Optional)
                    {
                        primitiveType += "?";
                    }

                    if (isArray)
                    {
                        primitiveType += "[]";
                    }

                    return primitiveType;
                }

                mappedType = $"{typeInfo.Namespace}.{typeInfo.TypeName}";
                if (typeDefinition.Optional)
                {
                    mappedType += "?";
                }
            }
            else if (knownTypes.TryGetValue($"{domainDefinition.Name}.{type}", out typeInfo))
            {
                mappedType = typeInfo.TypeName;
                if (typeDefinition.Optional)
                {
                    mappedType += "?";
                }
            }
            else
            {
                switch (type)
                {
                    case "number":
                        mappedType = "double";
                        break;

                    case "integer":
                        mappedType = "long";
                        break;

                    case "boolean":
                        mappedType = "bool";
                        break;

                    case "string":
                        mappedType = "string";
                        break;

                    case "object":
                    case "any":
                        mappedType = "object";
                        break;

                    case "binary":
                        mappedType = "byte[]";
                        break;

                    case "array":
                        var items = typeDefinition.Items ?? throw new InvalidOperationException("Type definition was type array but has no Items");
                        mappedType = GetTypeMappingForType(items, domainDefinition, knownTypes, isArray: true);
                        break;

                    default:
                        throw new InvalidOperationException($"Unmapped data type: {type}");
                }

                if (typeDefinition.Optional)
                {
                    mappedType += "?";
                }
            }

            if (isArray)
            {
                mappedType += "[]";
            }

            return mappedType;
        }

        public static string? ReplaceLineEndings(string? value, string? replacement = null)
        {
            if (string.IsNullOrEmpty(value))
            {
                return value;
            }

            replacement ??= string.Empty;

            return WhitespaceRegex().Replace(value, replacement);
        }

        [GeneratedRegex(@"\r\n?|\n|\u2028|\u2029", RegexOptions.Compiled)]
        private static partial Regex WhitespaceRegex();
    }
}
