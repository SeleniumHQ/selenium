package org.openqa.selenium.server.cli;

/**
 * Parse Remote Control Launcher Options
 */
public class RemoteControlLauncher {

    public static String getArg(String[] args, int i) {
        if (i >= args.length) {
            usage("expected at least one more argument");
            System.exit(-1);
        }
        return args[i];
    }

    public static void usage(String msg) {
        if (msg != null) {
            System.err.println(msg + ":");
        }
        String INDENT = "  ";
        String INDENT2X = INDENT+INDENT;
        printWrappedErrorLine("", "Usage: java -jar selenium-server.jar [-interactive] [options]\n");
        printWrappedErrorLine(INDENT, "-port <nnnn>: the port number the selenium server should use (default 4444)");
        printWrappedErrorLine(INDENT, "-timeout <nnnn>: an integer number of seconds before we should give up");
        printWrappedErrorLine(INDENT, "-interactive: puts you into interactive mode.  See the tutorial for more details");
        printWrappedErrorLine(INDENT, "-multiWindow: puts you into a mode where the test web site executes in a separate window, and selenium supports frames");
        printWrappedErrorLine(INDENT, "-forcedBrowserMode <browser>: sets the browser mode to a single argument (e.g. \"*iexplore\") for all sessions, no matter what is passed to getNewBrowserSession");


        printWrappedErrorLine(INDENT, "-forcedBrowserModeRestOfLine <browser>: sets the browser mode to all the remaining tokens on the line (e.g. \"*custom /some/random/place/iexplore.exe\") for all sessions, no matter what is passed to getNewBrowserSession");
        printWrappedErrorLine(INDENT, "-userExtensions <file>: indicates a JavaScript file that will be loaded into selenium");
        printWrappedErrorLine(INDENT, "-browserSessionReuse: stops re-initialization and spawning of the browser between tests");
        printWrappedErrorLine(INDENT, "-avoidProxy: By default, we proxy every browser request; set this flag to make the browser use our proxy only for URLs containing '/selenium-server'");
        printWrappedErrorLine(INDENT, "-firefoxProfileTemplate <dir>: normally, we generate a fresh empty Firefox profile every time we launch.  You can specify a directory to make us copy your profile directory instead.");
        printWrappedErrorLine(INDENT, "-debug: puts you into debug mode, with more trace information and diagnostics on the console");
        printWrappedErrorLine(INDENT, "-browserSideLog: enables logging on the browser side; logging messages will be transmitted to the server.  This can affect performance.");
        printWrappedErrorLine(INDENT, "-ensureCleanSession: If the browser does not have user profiles, make sure every new session has no artifacts from previous sessions.  For example, enabling this option will cause all user cookies to be archived before launching IE, and restored after IE is closed.");
        printWrappedErrorLine(INDENT, "-trustAllSSLCertificates: Forces the Selenium proxy to trust all SSL certificates.  This doesn't work in browsers that don't use the Selenium proxy.");
        printWrappedErrorLine(INDENT, "-log <logFileName>: writes lots of debug information out to a log file");
        printWrappedErrorLine(INDENT, "-htmlSuite <browser> <startURL> <suiteFile> <resultFile>: Run a single HTML Selenese (Selenium Core) suite and then exit immediately, using the specified browser (e.g. \"*firefox\") on the specified URL (e.g. \"http://www.google.com\").  You need to specify the absolute path to the HTML test suite as well as the path to the HTML results file we'll generate.");
        printWrappedErrorLine(INDENT, "-proxyInjectionMode: puts you into proxy injection mode, a mode where the selenium server acts as a proxy server " +
                "for all content going to the test application.  Under this mode, multiple domains can be visited, and the " +
                "following additional flags are supported:\n");
        printWrappedErrorLine(INDENT2X, "-dontInjectRegex <regex>: an optional regular expression that proxy injection mode can use to know when to bypss injection");
        printWrappedErrorLine(INDENT2X, "-userJsInjection <file>: specifies a JavaScript file which will then be injected into all pages");
        printWrappedErrorLine(INDENT2X, "-userContentTransformation <regex> <replacement>: a regular expression which is matched " +
                "against all test HTML content; the second is a string which will replace matches.  These flags can be used any " +
                "number of times.  A simple example of how this could be useful: if you add \"-userContentTransformation https http\" " +
                "then all \"https\" strings in the HTML of the test application will be changed to be \"http\".");
    }

    public static void printWrappedErrorLine(String prefix, String msg) {
        printWrappedErrorLine(prefix, msg, true);
    }

    public static void printWrappedErrorLine(String prefix, String msg, boolean first) {
        System.err.print(prefix);
        if (!first) {
            System.err.print("  ");
        }
        int defaultWrap = 70;
        int wrap = defaultWrap - prefix.length();
        if (wrap > msg.length()) {
            System.err.println(msg);
            return;
        }
        String lineRaw = msg.substring(0, wrap);
        int spaceIndex = lineRaw.lastIndexOf(' ');
        if (spaceIndex == -1) {
            spaceIndex = lineRaw.length();
        }
        String line = lineRaw.substring(0, spaceIndex);
        System.err.println(line);
        printWrappedErrorLine(prefix, msg.substring(spaceIndex+1), false);
    }
}
