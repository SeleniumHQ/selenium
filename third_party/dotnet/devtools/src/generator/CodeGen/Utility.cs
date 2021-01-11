namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
    using System;
    using System.Collections.Generic;
    using System.Text.RegularExpressions;

    /// <summary>
    /// Contains various utility methods.
    /// </summary>
    public static class Utility
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
            var type = typeDefinition.Type;

            if (String.IsNullOrWhiteSpace(type))
                type = typeDefinition.TypeReference;

            string mappedType = null;
            if (type.Contains(".") && knownTypes.ContainsKey(type))
            {
                var typeInfo = knownTypes[type];
                if (typeInfo.IsPrimitive)
                {
                    var primitiveType = typeInfo.TypeName;

                    if (typeDefinition.Optional && typeInfo.ByRef)
                        primitiveType += "?";

                    if (isArray)
                        primitiveType += "[]";

                    return primitiveType;
                }
                mappedType = $"{typeInfo.Namespace}.{typeInfo.TypeName}";
                if (typeDefinition.Optional && typeInfo.ByRef)
                    mappedType += "?";
            }

            if (mappedType == null)
            {
                var fullyQualifiedTypeName = $"{domainDefinition.Name}.{type}";

                if (knownTypes.ContainsKey(fullyQualifiedTypeName))
                {
                    var typeInfo = knownTypes[fullyQualifiedTypeName];

                    mappedType = typeInfo.TypeName;
                    if (typeInfo.ByRef && typeDefinition.Optional)
                        mappedType += "?";
                }
            }


            if (mappedType == null)
            {
                switch (type)
                {
                    case "number":
                        mappedType = typeDefinition.Optional ? "double?" : "double";
                        break;
                    case "integer":
                        mappedType = typeDefinition.Optional ? "long?" : "long";
                        break;
                    case "boolean":
                        mappedType = typeDefinition.Optional ? "bool?" : "bool";
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
                        mappedType = GetTypeMappingForType(typeDefinition.Items, domainDefinition, knownTypes, true);
                        break;
                    default:
                        throw new InvalidOperationException($"Unmapped data type: {type}");
                }
            }

            if (isArray)
                mappedType += "[]";

            return mappedType;
        }

        public static string ReplaceLineEndings(string value, string replacement = null)
        {
            if (String.IsNullOrEmpty(value))
            {
                return value;
            }

            if (replacement == null)
                replacement = string.Empty;

            return Regex.Replace(value, @"\r\n?|\n|\u2028|\u2029", replacement, RegexOptions.Compiled);
        }
    }
}
