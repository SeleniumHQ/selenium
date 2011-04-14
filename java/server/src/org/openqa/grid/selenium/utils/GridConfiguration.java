package org.openqa.grid.selenium.utils;

import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.cli.RemoteControlLauncher;

public class GridConfiguration {

	private GridRole role = GridRole.NOT_GRID;
	private URL registrationURL;
	private int port = 4444;
	private String host;
	private String[] seleniumServerargs = new String[0];
	private RemoteControlConfiguration nodeConfig = new RemoteControlConfiguration();
	private NetworkUtils networkUtils = new NetworkUtils();

	public static GridConfiguration parse(String[] args) {

		List<String> leftOver = new ArrayList<String>();

		GridConfiguration config = new GridConfiguration();
		for (int i = 0; i < args.length; i++) {
			String arg = args[i];
			if ("-role".equalsIgnoreCase(arg)) {
				i++;
				String v = getArgValue(args, i);
				if ("hub".equalsIgnoreCase(v)) {
					config.setRole(GridRole.HUB);
				} else if ("remotecontrol".equalsIgnoreCase(v) || "remote-control".equalsIgnoreCase(v) || "rc".equalsIgnoreCase(v)) {
					config.setRole(GridRole.REMOTE_CONTROL);
				} else if ("webdriver".equalsIgnoreCase(v) || "wd".equalsIgnoreCase(v)) {
					config.setRole(GridRole.WEBDRIVER);
				} else {
					config.setRole(GridRole.NOT_GRID);
					printHelpAndDie("wrong role");
				}
			} else if ("-hub".equalsIgnoreCase(arg)) {
				i++;
				String v = getArgValue(args, i);
				try {
					config.setRegistrationURL(new URL(v));
				} catch (MalformedURLException e) {
					printHelpAndDie("invalid url : " + v);
				}
			} else if ("-port".equalsIgnoreCase(arg)) {
				i++;
				String v = getArgValue(args, i);
				config.setPort(Integer.parseInt(v));
				// -port is common for Grid and SeleniumServer
				leftOver.add(arg);
				leftOver.add(v);
			} else if ("-host".equalsIgnoreCase(arg)) {
				String v = getArgValue(args, i);
				config.setHost(v);
			} else {
				leftOver.add(arg);
			}
		}
		config.setSeleniumServerArgs(leftOver);
		try {
			config.validate();
		} catch (InvalidParameterException e) {
			printHelpAndDie(e.getMessage());
		}
		return config;
	}

	/**
	 * returns the value of the argument indexed i.
	 * 
	 * @param args
	 * @param i
	 * @return
	 */
	private static String getArgValue(String[] args, int i) {
		if (i >= args.length) {
			printHelpAndDie("expected a value after " + args[i]);
		}
		return args[i];
	}

	private static void printHelpAndDie(String msg) {
		String INDENT = "  ";
		RemoteControlLauncher.printWrappedErrorLine("","Error with the parameters :"+msg);
		RemoteControlLauncher.printWrappedErrorLine("", "To use as a grid, specify a role and its arguments.");
		RemoteControlLauncher.printWrappedErrorLine(INDENT, "-role <hub|remotecontrol|webdriver> (default is no grid -- just run an RC server). When launching a node for webdriver"+
				" or remotecontrol, the parameters will be forwarded to the server on the node, so you can use something like -role remotecontrol -trustAllSSLCertificates." +
				" In that case, the SeleniumServer will be launch with the trustallCertificats option.");
		RemoteControlLauncher.printWrappedErrorLine(INDENT, "-hub <http://localhost:4444/grid/register> : the url that will be used to post the registration request.");
		RemoteControlLauncher.printWrappedErrorLine(INDENT, "-host <IP | hostname> : usually not needed and determined automatically. For exotic network configuration, network with VPN, " +
				"specifying the host might be necessary.");
		RemoteControlLauncher.printWrappedErrorLine(INDENT, "-port <xxxx> : the port the remote/hub will listen on.Default to 4444.");

		System.exit(-1);
	}

	public String getHost() {
		if (host == null) {
			host = networkUtils.getIp4NonLoopbackAddressOfThisMachine().getHostAddress();
		}
		return host;
	}

	public void setHost(String host) {
		this.host = host;
	}

	public URL getRegistrationURL() {
		return registrationURL;
	}

	public void setRegistrationURL(URL registrationURL) {
		this.registrationURL = registrationURL;
	}

	public GridRole getRole() {
		return role;
	}

	public int getPort2() {
		return port;
	}

	public void setRole(GridRole role) {
		this.role = role;

	}

	public void setPort(int port) {
		this.port = port;
		getNodeRemoteControlConfiguration().setPort(port);

	}

	/**
	 * Validate the current config
	 * 
	 * @throws InvalidParameterException
	 *             if the CLA are wrong
	 */
	public void validate() {
		if (role == GridRole.WEBDRIVER || role == GridRole.REMOTE_CONTROL) {
			if (registrationURL == null) {
				throw new InvalidParameterException("registration url cannot be null");
			}
		}

		// TODO freyanud : validation should also check that the selenium server
		// param passed to the node do not contain anything that doesn't make
		// sense in a grid environement.For instance launching a node with
		// -interactive.
		if (getNodeRemoteControlConfiguration().isInteractive() == true ){
			throw new InvalidParameterException("no point launching the node in interactive mode");
		}

	}

	public void setSeleniumServerArgs(List<String> leftOver) {
		seleniumServerargs = leftOver.toArray(new String[leftOver.size()]);
		nodeConfig = RemoteControlLauncher.parseLauncherOptions(seleniumServerargs);
	}

	public RemoteControlConfiguration getNodeRemoteControlConfiguration() {
		return nodeConfig;

	}

}
