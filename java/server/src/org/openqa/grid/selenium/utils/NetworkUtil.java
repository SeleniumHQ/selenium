package org.openqa.grid.selenium.utils;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;


public class NetworkUtil {


	public static String getIPv4Address() {
		try {
			Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces();

			NetworkInterface itf = null;
			while (en.hasMoreElements()) {
				itf = en.nextElement();
				if (!itf.isLoopback()) {
					Enumeration<InetAddress> addresses = itf.getInetAddresses();
					InetAddress addr = null;
					while (addresses.hasMoreElements()) {
						addr = addresses.nextElement();
						if (!isIPv6Address(addr.getHostAddress())) {
							return addr.getHostAddress();
						}
					}
				}
			}
		} catch (SocketException e) {
			e.printStackTrace();
			return null;
		}
		return null;
	}

	public static boolean isIPv6Address(String hostAddress) {
		return hostAddress.indexOf(":") != -1;
	}
}
