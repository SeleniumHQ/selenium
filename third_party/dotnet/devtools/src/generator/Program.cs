using System;
using System.IO;
using System.Text;
using CommandLine;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json.Serialization;
using OpenQA.Selenium.DevToolsGenerator.CodeGen;
using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace OpenQA.Selenium.DevToolsGenerator
{
    class Program
    {
        static int Main(string[] args)
        {
            CommandLineOptions cliArguments = new CommandLineOptions();
            Parser.Default.ParseArguments<CommandLineOptions>(args).WithParsed(o => { cliArguments = o; });

            //Load Settings.
            if (!File.Exists(cliArguments.Settings))
            {
                throw new FileNotFoundException($"The specified settings file ({cliArguments.Settings}) could not be found. Please check that the settings file exists.");
            }

            var settingsJson = File.ReadAllText(cliArguments.Settings);
            var settings = JsonSerializer.Deserialize<CodeGenerationSettings>(settingsJson)
                ?? throw new JsonException("CodeGenerationSettings JSON returned null");

            if (!string.IsNullOrEmpty(cliArguments.TemplatesPath))
            {
                settings.TemplatesPath = cliArguments.TemplatesPath;
                if (File.Exists(cliArguments.TemplatesPath))
                {
                    FileInfo info = new FileInfo(cliArguments.TemplatesPath);
                    settings.TemplatesPath = info.DirectoryName!;
                }
            }

            // setup our DI
            var serviceProvider = new ServiceCollection()
                .AddCodeGenerationServices(settings)
                .BuildServiceProvider();

            //Get the protocol Data.
            if (!cliArguments.Quiet)
            {
                Console.WriteLine("Loading protocol definition...");
            }

            var protocolDefinitionData = GetProtocolDefinitionData(cliArguments);

            var protocolDefinition = protocolDefinitionData.Deserialize<ProtocolDefinition.ProtocolDefinition>(new JsonSerializerOptions() { ReferenceHandler = ReferenceHandler.IgnoreCycles })
                ?? throw new JsonException("Protocol definition JSON returned null");

            //Begin the code generation process.
            if (!cliArguments.Quiet)
            {
                Console.WriteLine("Generating protocol definition code files...");
            }

            var protocolGenerator = serviceProvider.GetRequiredService<ICodeGenerator<ProtocolDefinition.ProtocolDefinition>>();
            var codeFiles = protocolGenerator.GenerateCode(protocolDefinition, null!);

            //Delete the output folder if force is specified and it exists...
            if (!cliArguments.Quiet)
            {
                Console.WriteLine("Writing generated code files to {0}...", cliArguments.OutputPath);
            }

            if (Directory.Exists(cliArguments.OutputPath) && cliArguments.ForceOverwrite)
            {
                if (!cliArguments.Quiet)
                {
                    Console.WriteLine("Generating protocol definition project...");
                }

                Directory.Delete(cliArguments.OutputPath, true);
            }

            //Create the output path if it doesn't exist, and write generated files to disk.
            var directoryInfo = Directory.CreateDirectory(cliArguments.OutputPath);

            var sha1 = System.Security.Cryptography.SHA1.Create();
            foreach (var codeFile in codeFiles)
            {
                var targetFilePath = Path.GetFullPath(Path.Combine(cliArguments.OutputPath, codeFile.Key));
                Directory.CreateDirectory(Path.GetDirectoryName(targetFilePath)!);
                //Only update the file if the SHA1 hashes don't match
                if (File.Exists(targetFilePath))
                {
                    var targetFileHash = sha1.ComputeHash(File.ReadAllBytes(targetFilePath));
                    var codeFileHash = sha1.ComputeHash(Encoding.UTF8.GetBytes(codeFile.Value));
                    if (string.Compare(Convert.ToBase64String(targetFileHash), Convert.ToBase64String(codeFileHash)) != 0)
                    {
                        File.WriteAllText(targetFilePath, codeFile.Value);
                    }
                }
                else
                {
                    File.WriteAllText(targetFilePath, codeFile.Value);
                }
            }

            //Completed.
            if (!cliArguments.Quiet)
            {
                Console.WriteLine("All done!");
            }

            return 0;
        }

        /// <summary>
        /// Returns a merged ProtocolDefinition JObject
        /// </summary>
        /// <param name="args"></param>
        /// <returns></returns>
        public static JsonObject GetProtocolDefinitionData(CommandLineOptions args)
        {
            JsonObject protocolData;
            string browserProtocolPath = args.BrowserProtocolPath;
            if (!File.Exists(browserProtocolPath))
            {
                browserProtocolPath = Path.Combine(browserProtocolPath, "browser_protocol.json");
                if (!File.Exists(browserProtocolPath))
                {
                }
            }

            string jsProtocolPath = args.JavaScriptProtocolPath;
            if (!File.Exists(args.JavaScriptProtocolPath))
            {
                jsProtocolPath = Path.Combine(jsProtocolPath, "js_protocol.json");
                if (!File.Exists(jsProtocolPath))
                {
                }
            }

            JsonObject? browserProtocol = JsonNode.Parse(File.ReadAllText(browserProtocolPath))?.AsObject();
            JsonObject? jsProtocol = JsonNode.Parse(File.ReadAllText(jsProtocolPath))?.AsObject();

            ProtocolVersionDefinition currentVersion = new ProtocolVersionDefinition();
            currentVersion.ProtocolVersion = "1.3";
            currentVersion.Browser = "Chrome/86.0";

            protocolData = MergeJavaScriptProtocolDefinitions(browserProtocol, jsProtocol);
            protocolData["browserVersion"] = JsonSerializer.SerializeToNode(currentVersion);

            return protocolData;
        }

        /// <summary>
        /// Merges a browserProtocol and jsProtocol into a single protocol definition.
        /// </summary>
        /// <param name="browserProtocol"></param>
        /// <param name="jsProtocol"></param>
        /// <returns></returns>
        public static JsonObject MergeJavaScriptProtocolDefinitions(JsonObject? browserProtocol, JsonObject? jsProtocol)
        {
            //Merge the 2 protocols together.
            if (jsProtocol!["version"]!["majorVersion"] != browserProtocol!["version"]!["majorVersion"] ||
                jsProtocol!["version"]!["minorVersion"] != browserProtocol!["version"]!["minorVersion"])
            {
                throw new InvalidOperationException("Protocol mismatch -- The WebKit and V8 protocol versions should match.");
            }

            var result = browserProtocol.DeepClone().AsObject();
            foreach (var domain in jsProtocol["domains"]!.AsArray())
            {
                JsonArray jDomains = result["domains"]!.AsArray();
                jDomains.Add(domain!.DeepClone());
            }

            return result;
        }
    }
}
