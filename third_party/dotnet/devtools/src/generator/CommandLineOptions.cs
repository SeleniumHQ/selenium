using CommandLine;
using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevToolsGenerator
{
    public class CommandLineOptions
    {
        public CommandLineOptions()
        {
        }

        [Option(
            'f',
            "force-download",
            Default = false,
            HelpText = "Forces the Chrome Protocol Definition to be downloaded from source even if it already exists.")]
        public bool ForceDownload { get; set; }

        [Option(
            'q',
            "quiet",
            Default = false,
            HelpText = "Suppresses console output.")]
        public bool Quiet { get; set; }

        [Option(
            "force",
            Default = false,
            HelpText = "Forces the output directory to be overwritten")]
        public bool ForceOverwrite { get; set; }

        [Option(
            'o',
            "output-path",
            Default = "./OutputProtocol",
            HelpText ="Indicates the folder that will contain the generated class library [Default: ./OutputProtocol]")]
        public string OutputPath { get; set; }

        [Option(
            'b',
            "browser-protocol-path",
            Default = "./browser_protocol.json",
            HelpText = "Indicates the path to the Chromium Debugging Browser Protocol JSON file to use. [Default: browser_protocol.json]")]
        public string BrowserProtocolPath { get; set; }

        [Option(
            'j',
            "js-protocol-path",
            Default = "./js_protocol.json",
            HelpText = "Indicates the path to the Chromium Debugging JavaScript Protocol JSON file to use. [Default: js_protocol.json]")]
        public string JavaScriptProtocolPath { get; set; }

        [Option(
            't',
            "templates-path",
            Default = "",
            HelpText = "Indicates the path to the code generation templates file.")]
        public string TemplatesPath { get; set; }

        [Option(
            's',
            "settings",
            Default = "./Templates/settings.json",
            HelpText = "Indicates the path to the code generation settings file. [Default: ./Templates/settings.json]")]
        public string Settings { get; set; }
    }
}
