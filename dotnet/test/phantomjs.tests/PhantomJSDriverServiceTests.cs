using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.RegularExpressions;
using System.Reflection;
using System.ComponentModel;

namespace OpenQA.Selenium.PhantomJS
{
    [TestFixture]
    public class PhantomJSDriverServiceTests
    {
        [Test]
        public void ShouldSerializeAndDeserializeNonDefaultOptionsWithoutLosingFidelity()
        {
            var suppliedService = CreateServiceWithNonDefaultValues();
            var deserializedService = SerializeAndDeserializeService(suppliedService);

            AssertSerializableProperties(suppliedService, deserializedService);
        }

        [Test]
        public void ShouldSerializeAndDeserializeNonDefaultOptionsUsingToJsonMethodWithoutLosingFidelity()
        {
            var suppliedService = CreateServiceWithNonDefaultValues();
            var deserializedService = SerializeAndDeserializeServiceUsingToJson(suppliedService);

            AssertSerializableProperties(suppliedService, deserializedService);
        }

        [Test]
        public void ShouldNotSerializeArguments()
        {
            var suppliedService = PhantomJSDriverService.CreateDefaultService();
            suppliedService.AddArgument("foo");
            suppliedService.AddArgument("bar");

            //string json = JsonConvert.SerializeObject(suppliedService);
            string json = suppliedService.ToJson();

            Assert.That(json.Contains("foo"), Is.False, "Actual JSON: " + json);
            Assert.That(json.Contains("bar"), Is.False, "Actual JSON: " + json);
        }

        [Test]
        public void ShouldNotSerializeUnmodifiedProperties()
        {
            var suppliedService = PhantomJSDriverService.CreateDefaultService();
            string json = suppliedService.ToJson();

            var parsedObject = JObject.Parse(json);

            Assert.That(parsedObject.Properties().Count(), Is.EqualTo(0), "Actual JSON: " + json);
        }

        [Test]
        public void ShouldSerializeToJsonPropertiesUsingCamelCaseConvention()
        {
            var suppliedService = CreateServiceWithNonDefaultValues();

            string json = JsonConvert.SerializeObject(suppliedService, Formatting.Indented);
            var parsedObject = JObject.Parse(json);

            // Get all propertes, except those we know aren't serializable
            var serializableProperties = GetSerializableProperties();

            var assertionMessage = new StringBuilder();

            // Ensure serialized properties follow camel-case naming conventions
            foreach (var property in serializableProperties)
            {
                string camelCaseName = property.Name.Substring(0, 1).ToLower() + property.Name.Substring(1);
                bool camelCaseJsonPropertyExists = parsedObject.Properties().Any(p => p.Name == camelCaseName);

                if (!camelCaseJsonPropertyExists)
                    assertionMessage.AppendFormat("\t'{0}' (for .NET property: '{1}')\r\n", camelCaseName, property.Name);
            }

            if (assertionMessage.Length > 0)
                Assert.Fail("The following JSON properties could not be found on the serialized object (based on expected camel-casing conventions when serializing from .NET):\r\n{0}", assertionMessage);
        }

        [Test]
        public void ShouldIncludeGenericArgumentsInCommandLineArgumentsWithALeadingSpace()
        {
            var driverService = PhantomJSDriverService.CreateDefaultService();
            driverService.AddArgument("--foo=bar");
            driverService.AddArgument("--bar=baz");

            var commandLineArguments = GetCommandLineArgumentsViaReflection(driverService);

            Assert.That(commandLineArguments.Contains(" --foo=bar --bar=baz"));
        }

        [Test]
        public virtual void ShouldNotIncludeAnyOtherCommandLineArgumentsIfConfigIsSpecified()
        {
            var driverService = CreateServiceWithNonDefaultValues();
            driverService.ConfigFile = "something";

            string commandLineArguments = GetCommandLineArgumentsViaReflection(driverService);

            var actualArguments = GetActualArguments(commandLineArguments);
            var expectedArguments = new List<string>(new[] { "webdriver", "config" });

            Assert.That(actualArguments, Is.EquivalentTo(expectedArguments));
        }

        [Test]
        public virtual void ShouldNotIncludeNonConfiguredOptionsInCommandLineArguments()
        {
            var driverService = PhantomJSDriverService.CreateDefaultService();

            string commandLineArguments = GetCommandLineArgumentsViaReflection(driverService);

            var actualArguments = GetActualArguments(commandLineArguments);
            var expectedArguments = new List<string>(new[] { "webdriver" });

            Assert.That(actualArguments, Is.EquivalentTo(expectedArguments));
        }

        [Test]
        public virtual void ShouldIncludeAllConfiguredOptionsAsCommandLineArguments()
        {
            var driverService = CreateServiceWithNonDefaultValues();

            string commandLineArguments = GetCommandLineArgumentsViaReflection(driverService);

            var actualArguments = GetActualArguments(commandLineArguments);
            var expectedArguments = GetExpectedArguments();

            Assert.That(actualArguments, Is.EquivalentTo(expectedArguments));
        }

        private static List<string> GetExpectedArguments()
        {
            var expectedArguments = new List<string>(new[] { "webdriver" });

            var serializableProperties = GetSerializableProperties();

            foreach (var property in serializableProperties)
            {
                // Translate property name to the PhantomJS command-line argument name (using convention)
                string argumentName = Regex.Replace(property.Name, "([A-Z](?=[A-Z])|[A-Z][a-z0-9]+)", "$1-").TrimEnd('-').ToLower();
                expectedArguments.Add(argumentName);
            }

            return expectedArguments;
        }

        private static List<string> GetActualArguments(string commandLineArguments)
        {
            // Parse the command line into individual argument names
            var argumentMatches = Regex.Matches(" " + commandLineArguments.Trim(), @" --(?<ArgName>[\w-]+)=");

            var arguments = new List<string>();

            foreach (Match argumentMatch in argumentMatches)
            {
                string argumentName = argumentMatch.Groups["ArgName"].Value;
                arguments.Add(argumentName);
            }

            return arguments;
        }

        private static string GetCommandLineArgumentsViaReflection(PhantomJSDriverService driverService)
        {
            // Use reflection to access protected CommandLineArguments property
            var commandLineArgumentsProperty = typeof(PhantomJSDriverService).GetProperty("CommandLineArguments",
                                                                                          BindingFlags.NonPublic |
                                                                                          BindingFlags.Instance);
            var commandLineArguments = commandLineArgumentsProperty.GetValue(driverService, null) as string;
            return commandLineArguments;
        }

        private static PhantomJSDriverService SerializeAndDeserializeService(PhantomJSDriverService suppliedService)
        {
            string json = JsonConvert.SerializeObject(suppliedService, Formatting.Indented);
            var deserializedService = JsonConvert.DeserializeObject<PhantomJSDriverService>(json);

            return deserializedService;
        }

        private static PhantomJSDriverService SerializeAndDeserializeServiceUsingToJson(PhantomJSDriverService suppliedService)
        {
            string json = suppliedService.ToJson();
            var deserializedService = JsonConvert.DeserializeObject<PhantomJSDriverService>(json);

            return deserializedService;
        }

        private static IEnumerable<PropertyInfo> GetSerializableProperties()
        {
            var serializableProperties =
                from p in typeof(PhantomJSDriverService).GetProperties()
                where p.GetCustomAttributes(typeof(JsonPropertyAttribute), true).Any()
                select p;
            return serializableProperties;
        }

        private static void AssertSerializableProperties(PhantomJSDriverService suppliedService,
                                                         PhantomJSDriverService deserializedService)
        {
            var serializableProperties = GetSerializableProperties();

            foreach (var property in serializableProperties)
            {
                object expectedValue = property.GetValue(suppliedService, null);
                object actualValue = property.GetValue(deserializedService, null);

                Assert.That(expectedValue, Is.EqualTo(actualValue),
                            string.Format("Value for property '{0}' did not match.", property.Name));
            }
        }

        private static int number = 1;

        private static PhantomJSDriverService CreateServiceWithNonDefaultValues()
        {
            var suppliedService = PhantomJSDriverService.CreateDefaultService();

            var properties = suppliedService.GetType().GetProperties();

            foreach (var property in properties)
            {
                var jsonAttribute = property.GetCustomAttributes(typeof(JsonPropertyAttribute), false).SingleOrDefault() as JsonPropertyAttribute;
                var defaultValueAttrbute = property.GetCustomAttributes(typeof(DefaultValueAttribute), false).SingleOrDefault() as DefaultValueAttribute;

                if (jsonAttribute != null)
                {
                    switch (property.PropertyType.Name)
                    {
                        case "String":
                            // Supply a distinct string
                            property.SetValue(suppliedService, "string" + number++, null);
                            break;

                        case "Boolean":
                            // Use the value opposite the configured default
                            property.SetValue(suppliedService, !(Convert.ToBoolean(defaultValueAttrbute.Value)), null);
                            break;

                        case "Int32":
                            // Supply a non-zero number
                            property.SetValue(suppliedService, number++, null);
                            break;
                    }
                }
            }

            return suppliedService;
        }
    }
}
