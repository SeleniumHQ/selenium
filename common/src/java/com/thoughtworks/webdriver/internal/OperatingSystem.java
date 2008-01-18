// Copyright 2008 Google Inc. All Rights Reserved.

package com.thoughtworks.webdriver.internal;

public enum OperatingSystem {
	WINDOWS("win") {
		@Override
		public String getLineEnding() {
			return "\r\n";
		}
	},
	MAC("mac") {
		@Override
		public String getLineEnding() {
			return "\r";
		}
	},
	UNIX("x") {
		@Override
		public String getLineEnding() {
			return "\n";
		}
	};

	private static OperatingSystem currentOs;
	private final String partOfOsName;

	private OperatingSystem(String partOfOsName) {
		this.partOfOsName = partOfOsName;
	}

	public static OperatingSystem getCurrentPlatform() {
		if (currentOs != null) {
			return currentOs;
		}
		
		for (OperatingSystem os : OperatingSystem.values()) {
			if (os.isCurrentPlatform()) {
				currentOs = os;
				return os;
			}
		}

		// Default to assuming we're on a unix variant (including linux)
		currentOs = UNIX;
		return UNIX;
	}

	public abstract String getLineEnding();

	private boolean isCurrentPlatform() {
		String osName = System.getProperty("os.name").toLowerCase();
		return osName.indexOf(partOfOsName) != -1;
	}
}
