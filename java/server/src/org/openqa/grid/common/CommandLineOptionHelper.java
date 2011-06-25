package org.openqa.grid.common;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.openqa.grid.common.exception.GridConfigurationException;

public class CommandLineOptionHelper {

	private String[] args;

	@SuppressWarnings("unused")
	private CommandLineOptionHelper() {

	}

	public CommandLineOptionHelper(String[] args) {
		this.args = args;
	}

	public boolean isParamPresent(String name) {
		for (int i = 0; i < args.length; i++) {
			if (name.equalsIgnoreCase(args[i])) {
				return true;
			}
		}
		return false;
	}

	public String getParamValue(String name) {
		int index = -1;
		for (int i = 0; i < args.length; i++) {
			if (name.equals(args[i])) {
				index = i;
				break;
			}
		}
		if (index == -1) {
			throw new GridConfigurationException("The parameter " + name + " isn't specified.");
		}
		if (args.length == index) {
			throw new GridConfigurationException("The parameter " + name + " doesn't have a value specified.");
		}
		return args[index + 1];
	}

	public List<String> getParamValues(String name) {
		String value = getParamValue(name);
		return Arrays.asList(value.split(","));
	}

	public List<String> getKeys() {
		List<String> keys = new ArrayList<String>();
		for (int i = 0; i < args.length; i++) {
			if (args[i].startsWith("-")) {
				keys.add(args[i]);
			}
		}
		return keys;
	}

}
