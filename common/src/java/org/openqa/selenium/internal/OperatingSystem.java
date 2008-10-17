// Copyright 2008 Google Inc. All Rights Reserved.

package org.openqa.selenium.internal;

public enum OperatingSystem {
	WINDOWS("win") {
		@Override
		public String getLineEnding() {
			return "\r\n";
		}
	},
	MAC("mac", "darwin") {
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
        },
        ANY("") {
               @Override
               public String getLineEnding() {
                   throw new UnsupportedOperationException("getLineEnding");
               }
        };

	private static OperatingSystem currentOs;
	private final String[] partOfOsName;

	private OperatingSystem(String... partOfOsName) {
		this.partOfOsName = partOfOsName;
	}

	public static OperatingSystem getCurrentPlatform() {
		if (currentOs != null) {
			return currentOs;
		}

                OperatingSystem mostLikely = UNIX;
                for (OperatingSystem os : OperatingSystem.values()) {
                  for (String matcher : os.partOfOsName) {
                        if ("".equals(matcher))
                          continue;

                        if (os.isExactMatch(matcher)) {
                          currentOs = os;
                          return os;
                        }
                        if (os.isCurrentPlatform(matcher)) {
			  mostLikely = os;
			}
                  }
                }

		// Default to assuming we're on a unix variant (including linux)
		currentOs = mostLikely;
		return mostLikely;
	}

        public abstract String getLineEnding();

	private boolean isCurrentPlatform(String matchAgainst) {
		String osName = System.getProperty("os.name").toLowerCase();
		return osName.indexOf(matchAgainst) != -1;
	}

        private boolean isExactMatch(String matchAgainst) {
              String osName = System.getProperty("os.name").toLowerCase();
              return matchAgainst.equals(osName);
        }

}
