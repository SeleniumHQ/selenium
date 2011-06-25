package org.openqa.grid.selenium.utils;

import java.util.ArrayList;
import java.util.List;

import org.openqa.grid.common.exception.GridConfigurationException;

public enum GridRole {
	NOT_GRID, HUB, REMOTE_CONTROL, WEBDRIVER;

	/**
	 * finds the requested role from the parameters.
	 * 
	 * @param args
	 * @return the role in the grid from the -role param
	 */
	public static GridRole find(String[] args) {
		if (args == null) {
			return NOT_GRID;
		}
		for (int i = 0; i < args.length; i++) {
			if ("-role".equals(args[i])) {
				if (i == args.length) {
					throw new GridConfigurationException("-role needs to be followed by the role of this component in the grid.");
				} else {
					String role = args[i + 1].toLowerCase();
					if (RCAliases().contains(role)) {
						return REMOTE_CONTROL;
					} else if (WDAliases().contains(role)) {
						return WEBDRIVER;
					} else if ("hub".equals(role)) {
						return HUB;
					} else {
						throw new GridConfigurationException("The role specified :" + role + " doesn't match a recognized role for grid.");
					}
				}
			}
		}
		return NOT_GRID;
	}

	private static List<String> RCAliases() {
		List<String> res = new ArrayList<String>();
		res.add("rc");
		res.add("remotecontrol");
		res.add("remote-control");
		return res;
	}

	private static List<String> WDAliases() {
		List<String> res = new ArrayList<String>();
		res.add("wd");
		res.add("webdriver");
		return res;
	}
}
