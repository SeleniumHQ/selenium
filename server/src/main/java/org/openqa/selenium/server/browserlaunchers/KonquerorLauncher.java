package org.openqa.selenium.server.browserlaunchers;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;

import net.sf.cotta.TDirectory;
import net.sf.cotta.TFileFactory;
import net.sf.cotta.utils.ClassPathLocator;

public class KonquerorLauncher extends AbstractBrowserLauncher {
	private static final String KONQUEROR_PROFILE_SRC_LOCATION = "konqueror";

	private static final String KONQUEROR_PROFILE_DEST_LOCATION = System.getProperty("user.home") + "/.kde/share/config";

	private static final String DEFAULT_KONQUEROR_LOCATION = "/usr/bin/konqueror";

	private Process process;

	private String browserLaunchLocation;

	private int port;

	public KonquerorLauncher(int port, String sessionId) {
		this(port, sessionId, DEFAULT_KONQUEROR_LOCATION);
	}

	public KonquerorLauncher(int port, String sessionId, String browserLaunchLocation) {
		super(sessionId);
		this.port = port;
		this.browserLaunchLocation = browserLaunchLocation;
	}

	@Override
	protected void launch(String url) {
		try {
			makeCustomProfile();
		} catch (IOException e) {
			e.printStackTrace();
		}
		exec(browserLaunchLocation + " " + url);
	}

	private TDirectory makeCustomProfile() throws IOException {
		TDirectory profileSrc = new ClassPathLocator(getClass()).locate().asDirectory().dir(KONQUEROR_PROFILE_SRC_LOCATION);
		TDirectory profileDest = new TFileFactory().dir(KONQUEROR_PROFILE_DEST_LOCATION);

		File pacFile = LauncherUtils.makeProxyPAC(new File(KONQUEROR_PROFILE_DEST_LOCATION), port);

		File kioslaverc = new File(KONQUEROR_PROFILE_DEST_LOCATION, "kioslaverc");
		PrintStream out = new PrintStream(new FileOutputStream(kioslaverc));
		out.println("PersistentProxyConnection=false");
		out.println("[Proxy Settings]");
		out.println("AuthMode=0");
		out.println("Proxy Config Script=file://" + pacFile.getAbsolutePath());
		out.println("ProxyType=2");
		out.println("ReversedException=false");
		out.close();

		LauncherUtils.copyDirectory(profileSrc, profileDest);
		return profileDest;
	}

	public void close() {
		process.destroy();
	}

	protected void exec(String command) {

		try {
			process = Runtime.getRuntime().exec(command);
		} catch (IOException e) {
			throw new RuntimeException("Error starting browser by executing command " + command + ": " + e);
		}
	}

	public static void main(String... strings) throws Exception {
		TDirectory dir = new TFileFactory().dir(KONQUEROR_PROFILE_DEST_LOCATION);
		System.out.println(dir.path());
		KonquerorLauncher launcher = new KonquerorLauncher(4444, "jsdklfjslkf");
		launcher.launch("http://www.google.com/selenium-server/core/TestRunner.html?multiWindow=true&test=../tests/TestSuite.html");
		Thread.sleep(15000);
		// launcher.close();
	}

}
