package org.openqa.grid.selenium;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;

import org.hamcrest.generator.qdox.model.IndentBuffer;
import org.openqa.grid.selenium.utils.GridConfiguration;
import org.openqa.grid.selenium.utils.GridRole;
import org.openqa.grid.selenium.utils.SeleniumProtocol;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.Platform;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.cli.RemoteControlLauncher;

public class GridLauncher {

	final static String msg = "parameters : (Order is important)\n" + "type=hub\n" + "type=rc hub=X1 port=X2\n" + "type=webdriver hub=X1 port=X2";

	public static GridConfiguration parse(String[] args) {
		GridConfiguration config = new GridConfiguration();
		for (int i = 0; i < args.length; i++) {
			String arg = args[i];
			if ("-role".equalsIgnoreCase(arg)) {
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
				String v = getArgValue(args, i);
				try {
					config.setRegitrationURL(new URL(v));
				} catch (MalformedURLException e) {
					printHelpAndDie("invalid url : " + v);
				}
			} else if ("-port".equalsIgnoreCase(arg)) {
				String v = getArgValue(args, i);
				config.setPort(Integer.parseInt(v));
			}else if ("-host".equalsIgnoreCase(arg)) {
				String v = getArgValue(args, i);
				config.setHost(v);
			}
		}
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
		int indexValue = i+1;
		if (indexValue >= args.length) {
			printHelpAndDie("expected a value after " + args[indexValue]);
		}
		return args[indexValue];
	}

	private static void printHelpAndDie(String msg) {
        String INDENT = "  ";

        RemoteControlLauncher.printWrappedErrorLine("", "To use as a grid, specify a role and its arguments.");
        RemoteControlLauncher.printWrappedErrorLine(INDENT, "-role <hub|remotecontrol|webdriver> (default is no grid -- just run an RC server).");
 		RemoteControlLauncher.printWrappedErrorLine(INDENT, "-hub <http://localhost:4444/grid/register> : the url that will be used to post the registration request.");
		RemoteControlLauncher.printWrappedErrorLine(INDENT, "-port <xxxx> : the port the remote/hub will listen on.");

		System.exit(-1);
	}

	/**
	 * launches a grid component ( either hub, remote control node or webdriver
	 * node ).
	 * 
	 * @param config
	 * @throws Exception
	 */
	public static void launch(GridConfiguration config) throws Exception {
		SeleniumProtocol protocol;

		switch (config.getRole()) {
		case HUB:
			// TODO freynaud use the config for the port.
			Hub.getInstance().start();
			return;
		case WEBDRIVER:
			protocol = SeleniumProtocol.WebDriver;
			break;
		case REMOTE_CONTROL:
			protocol = SeleniumProtocol.Selenium;
			break;
		default:
			throw new RuntimeException("NI");
		}

		SelfRegisteringRemote remote = SelfRegisteringRemote.create(protocol, config.getPort(), config.getRegistrationURL());
		remote.setHost(config.getHost());
		
		// TODO freynaud : use config for that.
		remote.addFirefoxSupport(null);
		remote.addFirefoxSupport(null);
		remote.addFirefoxSupport(null);
		remote.addFirefoxSupport(null);
		remote.addFirefoxSupport(null);
		remote.addInternetExplorerSupport();
		remote.addChromeSupport();
		remote.setMaxConcurrentSession(5);
		remote.setTimeout(30000, 10000);
		remote.launchRemoteServer();
		
		remote.registerToHub();

	}

	public static void main(String[] args) throws Exception {
		GridConfiguration config = parse(args);
	
		if (config.getRole() == GridRole.NOT_GRID) {
			SeleniumServer.main(args);
		} else {
			launch(config);
		}

	}
}
