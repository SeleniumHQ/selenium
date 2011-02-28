/*
Copyright 2007-2011 WebDriver committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.grid.e2e;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;

import org.openqa.grid.selenium.SelfRegisteringRemote;
import org.openqa.grid.selenium.utils.SeleniumProtocol;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * will do for now. Launch hub /node programatically to have more configuration.
 */
public class DemoTmp {

	
	final static String msg =
		"parameters : (Order is important)\n"+
		"type=hub\n" + 
	    "type=rc hub=X1 port=X2\n"+
	    "type=webdriver hub=X1 port=X2";

	public static void main(String[] args) throws Exception {
		try {
			if (args.length == 0 || !args[0].startsWith("type=")) {
				throw new InvalidParameterException();
			} else if ("type=hub".equals(args[0])) {
				Hub.getInstance().start();
			} else if ("type=rc".equals(args[0])) {
				rc(args);
			} else if ("type=webdriver".equals(args[0])) {
				webdriver(args);
			} else {
				throw new InvalidParameterException();
			}
		} catch (InvalidParameterException e) {
			System.err.println(msg);
		}
		
		FileWriter fstream = new FileWriter("config.txt");
		BufferedWriter out = new BufferedWriter(fstream);
		out.write("test");
		out.close();
	}

	private static void rc(String[] args) throws Exception {
		if (args.length < 3) {
			throw new InvalidParameterException();
		} else {
			String hub=args[1].replace("hub=", "");
			String port=args[2].replace("port=", "");
			System.out.println("Launching a selenium remote control (*firefox) on port "+port+" , registering to hub "+hub);
			SelfRegisteringRemote remote = SelfRegisteringRemote.create(SeleniumProtocol.Selenium, Integer.parseInt(port), new URL(hub));
			remote.addFirefoxSupport(null);
			remote.setTimeout(30000, 10000);
			remote.launchRemoteServer();
			remote.registerToHub();
		}
		

	}

	private static void webdriver(String[] args) throws Exception {
		if (args.length < 3) {
			throw new InvalidParameterException();
		} else {
			String hub=args[1].replace("hub=", "");
			String port=args[2].replace("port=", "");
			System.out.println("Launching a webdriver (5 firefox, 1 IE, 1 chrome , max = 5 ) on port "+port+" , registering to hub "+hub);
			SelfRegisteringRemote remote = SelfRegisteringRemote.create(SeleniumProtocol.WebDriver, Integer.parseInt(port), new URL(hub));
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
	}
	
	
	private final String hubIp = "192.168.0.5";
	@Test(invocationCount=3,threadPoolSize=3)
	public void test() throws MalformedURLException, InterruptedException {
		WebDriver driver = null;
		try {
			DesiredCapabilities ff = DesiredCapabilities.firefox();
			driver = new RemoteWebDriver(new URL("http://"+hubIp+":4444/grid/driver"), ff);
			driver.get("http://"+hubIp+":4444/grid/console");
			Assert.assertEquals(driver.getTitle(), "Grid overview");
		} finally {
			driver.quit();
		}
	}

}
