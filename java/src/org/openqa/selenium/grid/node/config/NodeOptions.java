// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.grid.node.config;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Multimap;
import java.io.File;
import java.io.StringReader;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.StreamSupport;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.data.SlotMatcher;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.Urls;
import org.openqa.selenium.remote.Browser;
import org.openqa.selenium.remote.service.DriverService;

public class NodeOptions {

  public static final int DEFAULT_MAX_SESSIONS = Runtime.getRuntime().availableProcessors();
  public static final int DEFAULT_HEARTBEAT_PERIOD = 60;
  public static final int DEFAULT_SESSION_TIMEOUT = 300;
  public static final int DEFAULT_DRAIN_AFTER_SESSION_COUNT = 0;
  public static final boolean DEFAULT_ENABLE_CDP = true;
  public static final boolean DEFAULT_ENABLE_BIDI = true;
  static final String NODE_SECTION = "node";
  static final boolean DEFAULT_DETECT_DRIVERS = true;
  static final boolean DEFAULT_USE_SELENIUM_MANAGER = false;
  static final boolean OVERRIDE_MAX_SESSIONS = false;
  static final String DEFAULT_VNC_ENV_VAR = "SE_START_XVFB";
  static final int DEFAULT_NO_VNC_PORT = 7900;
  static final int DEFAULT_REGISTER_CYCLE = 10;
  static final int DEFAULT_REGISTER_PERIOD = 120;
  static final String DEFAULT_NODE_IMPLEMENTATION =
      "org.openqa.selenium.grid.node.local.LocalNodeFactory";
  static final String DEFAULT_SLOT_MATCHER = "org.openqa.selenium.grid.data.DefaultSlotMatcher";
  private static final Logger LOG = Logger.getLogger(NodeOptions.class.getName());
  private static final Json JSON = new Json();
  private static final Platform CURRENT_PLATFORM = Platform.getCurrent();
  private static final ImmutableSet<String> SINGLE_SESSION_DRIVERS =
      ImmutableSet.of("safari", "safari technology preview");

  private final Config config;
  private final AtomicBoolean vncEnabled = new AtomicBoolean();
  private final AtomicBoolean vncEnabledValueSet = new AtomicBoolean();

  public NodeOptions(Config config) {
    this.config = Require.nonNull("Config", config);
  }

  public Optional<URI> getPublicGridUri() {
    Optional<URI> gridUri =
        config
            .get(NODE_SECTION, "grid-url")
            .map(
                url -> {
                  try {
                    return new URI(url);
                  } catch (URISyntaxException e) {
                    throw new ConfigException("Unable to construct public URL: " + url);
                  }
                });

    if (gridUri.isPresent()) {
      return gridUri;
    }

    Optional<String> hubAddress = config.get(NODE_SECTION, "hub");
    if (hubAddress.isEmpty()) {
      return Optional.empty();
    }

    URI base = hubAddress.map(Urls::from).get();
    try {
      URI baseUri = base;
      if (baseUri.getPort() == -1) {
        baseUri =
            new URI(
                baseUri.getScheme() == null ? "http" : baseUri.getScheme(),
                baseUri.getUserInfo(),
                baseUri.getHost(),
                4444,
                baseUri.getPath(),
                baseUri.getQuery(),
                baseUri.getFragment());
      }
      String nonLoopbackAddress = "0.0.0.0";
      if (nonLoopbackAddress.equals(baseUri.getHost())) {
        try {
          nonLoopbackAddress = new NetworkUtils().getNonLoopbackAddressOfThisMachine();
        } catch (WebDriverException ignore) {
          // ignore this path as we still use "0.0.0.0"
        }
        baseUri =
            new URI(
                baseUri.getScheme(),
                baseUri.getUserInfo(),
                nonLoopbackAddress,
                baseUri.getPort(),
                baseUri.getPath(),
                baseUri.getQuery(),
                baseUri.getFragment());
      }
      return Optional.of(baseUri);
    } catch (URISyntaxException e) {
      throw new ConfigException("Unable to construct public URL: " + base);
    }
  }

  public boolean isManagedDownloadsEnabled() {
    return config.getBool(NODE_SECTION, "enable-managed-downloads").orElse(Boolean.FALSE);
  }

  public String getGridSubPath() {
    return normalizeSubPath(getPublicGridUri().map(URI::getPath).orElse(""));
  }

  public static String normalizeSubPath(String prefix) {
    prefix = prefix.trim();
    if (!prefix.startsWith("/")) {
      prefix = "/" + prefix; // Prefix with a '/' if absent.
    }
    if (prefix.endsWith("/")) {
      prefix = prefix.substring(0, prefix.length() - 1); // Remove the trailing '/' if present.
    }
    return prefix;
  }

  public Node getNode() {
    return config.getClass(NODE_SECTION, "implementation", Node.class, DEFAULT_NODE_IMPLEMENTATION);
  }

  public Duration getRegisterCycle() {
    // If the user sets 0 or less, we default to 1s.
    int seconds =
        Math.max(config.getInt(NODE_SECTION, "register-cycle").orElse(DEFAULT_REGISTER_CYCLE), 1);

    return Duration.ofSeconds(seconds);
  }

  public SlotMatcher getSlotMatcher() {
    return config.getClass("distributor", "slot-matcher", SlotMatcher.class, DEFAULT_SLOT_MATCHER);
  }

  public Duration getRegisterPeriod() {
    // If the user sets 0 or less, we default to 1s.
    int seconds =
        Math.max(config.getInt(NODE_SECTION, "register-period").orElse(DEFAULT_REGISTER_PERIOD), 1);

    return Duration.ofSeconds(seconds);
  }

  public Duration getHeartbeatPeriod() {
    // If the user sets 0 or less, we default to 1s.
    int seconds =
        Math.max(
            config.getInt(NODE_SECTION, "heartbeat-period").orElse(DEFAULT_HEARTBEAT_PERIOD), 1);
    return Duration.ofSeconds(seconds);
  }

  public Map<Capabilities, Collection<SessionFactory>> getSessionFactories(
      /* Danger! Java stereotype ahead! */
      Function<ImmutableCapabilities, Collection<SessionFactory>> factoryFactory) {

    LOG.log(Level.INFO, "Detected {0} available processors", DEFAULT_MAX_SESSIONS);
    boolean overrideMaxSessions =
        config.getBool(NODE_SECTION, "override-max-sessions").orElse(OVERRIDE_MAX_SESSIONS);
    if (overrideMaxSessions) {
      LOG.log(
          Level.WARNING,
          "Overriding max recommended number of {0} concurrent sessions. "
              + "Session stability and reliability might suffer!",
          DEFAULT_MAX_SESSIONS);
      LOG.warning(
          "One browser session is recommended per available processor. "
              + "Safari is always limited to 1 session per host.");
      LOG.warning(
          "Overriding this value for Internet Explorer is not recommended. "
              + "Issues related to parallel testing with Internet Explored won't be accepted.");
      LOG.warning("Double check if enabling 'override-max-sessions' is really needed");
    }
    int maxSessions = getMaxSessions();
    if (maxSessions > DEFAULT_MAX_SESSIONS) {
      LOG.log(Level.WARNING, "Max sessions set to {0} ", maxSessions);
    }

    Map<WebDriverInfo, Collection<SessionFactory>> allDrivers =
        discoverDrivers(maxSessions, factoryFactory);

    ImmutableMultimap.Builder<Capabilities, SessionFactory> sessionFactories =
        ImmutableMultimap.builder();

    addDriverFactoriesFromConfig(sessionFactories);
    addDriverConfigs(factoryFactory, sessionFactories, maxSessions);
    addSpecificDrivers(allDrivers, sessionFactories);
    addDetectedDrivers(allDrivers, sessionFactories);

    return sessionFactories.build().asMap();
  }

  public int getMaxSessions() {
    int maxSessions = config.getInt(NODE_SECTION, "max-sessions").orElse(DEFAULT_MAX_SESSIONS);
    Require.positive("Driver max sessions", maxSessions);
    boolean overrideMaxSessions =
        config.getBool(NODE_SECTION, "override-max-sessions").orElse(OVERRIDE_MAX_SESSIONS);
    if (maxSessions > DEFAULT_MAX_SESSIONS && overrideMaxSessions) {
      return maxSessions;
    }
    return Math.min(maxSessions, DEFAULT_MAX_SESSIONS);
  }

  public Duration getSessionTimeout() {
    // If the user sets 10s or less, we default to 10s.
    int seconds =
        Math.max(
            config.getInt(NODE_SECTION, "session-timeout").orElse(DEFAULT_SESSION_TIMEOUT), 10);
    return Duration.ofSeconds(seconds);
  }

  public boolean isCdpEnabled() {
    return config.getBool(NODE_SECTION, "enable-cdp").orElse(DEFAULT_ENABLE_CDP);
  }

  public boolean isBiDiEnabled() {
    return config.getBool(NODE_SECTION, "enable-bidi").orElse(DEFAULT_ENABLE_BIDI);
  }

  public int getDrainAfterSessionCount() {
    return Math.max(
        config
            .getInt(NODE_SECTION, "drain-after-session-count")
            .orElse(DEFAULT_DRAIN_AFTER_SESSION_COUNT),
        DEFAULT_DRAIN_AFTER_SESSION_COUNT);
  }

  @VisibleForTesting
  boolean isVncEnabled() {
    String vncEnvVar = config.get(NODE_SECTION, "vnc-env-var").orElse(DEFAULT_VNC_ENV_VAR);
    if (!vncEnabledValueSet.getAndSet(true)) {
      vncEnabled.set(Boolean.parseBoolean(System.getenv(vncEnvVar)));
    }
    return vncEnabled.get();
  }

  @VisibleForTesting
  int noVncPort() {
    return config.getInt(NODE_SECTION, "no-vnc-port").orElse(DEFAULT_NO_VNC_PORT);
  }

  private void addDriverFactoriesFromConfig(
      ImmutableMultimap.Builder<Capabilities, SessionFactory> sessionFactories) {
    config
        .getAll(NODE_SECTION, "driver-factories")
        .ifPresent(
            allConfigs -> {
              if (allConfigs.size() % 2 != 0) {
                throw new ConfigException("Expected each driver class to be mapped to a config");
              }

              Map<String, String> configMap =
                  IntStream.range(0, allConfigs.size() / 2)
                      .boxed()
                      .collect(
                          Collectors.toMap(
                              i -> allConfigs.get(2 * i), i -> allConfigs.get(2 * i + 1)));

              configMap.forEach(
                  (clazz, config) -> {
                    Capabilities stereotype = JSON.toType(config, Capabilities.class);
                    SessionFactory sessionFactory = createSessionFactory(clazz, stereotype);
                    sessionFactories.put(stereotype, sessionFactory);
                  });
            });
  }

  private SessionFactory createSessionFactory(String clazz, Capabilities stereotype) {
    LOG.fine(String.format("Creating %s as instance of %s", clazz, SessionFactory.class));

    try {
      // Use the context class loader since this is what the `--ext`
      // flag modifies.
      Class<?> ClassClazz =
          Class.forName(clazz, true, Thread.currentThread().getContextClassLoader());
      Method create = ClassClazz.getMethod("create", Config.class, Capabilities.class);

      if (!Modifier.isStatic(create.getModifiers())) {
        throw new IllegalArgumentException(
            String.format(
                "Class %s's `create(Config, Capabilities)` method must be static", clazz));
      }

      if (!SessionFactory.class.isAssignableFrom(create.getReturnType())) {
        throw new IllegalArgumentException(
            String.format(
                "Class %s's `create(Config, Capabilities)` method must be static", clazz));
      }

      return (SessionFactory) create.invoke(null, config, stereotype);
    } catch (NoSuchMethodException e) {
      throw new IllegalArgumentException(
          String.format(
              "Class %s must have a static `create(Config, Capabilities)` method", clazz));
    } catch (ReflectiveOperationException e) {
      throw new IllegalArgumentException("Unable to find class: " + clazz, e);
    }
  }

  private void addDriverConfigs(
      Function<ImmutableCapabilities, Collection<SessionFactory>> factoryFactory,
      ImmutableMultimap.Builder<Capabilities, SessionFactory> sessionFactories,
      int maxSessions) {

    Multimap<WebDriverInfo, SessionFactory> driverConfigs = HashMultimap.create();

    // get all driver configuration settings
    config
        .getArray(NODE_SECTION, "driver-configuration")
        // if configurations exist
        .ifPresent(
            drivers -> {
              List<Map<String, String>> configList = new ArrayList<>();
              if (drivers.isEmpty()) {
                // This is the case when the configuration is provided through the CLI.
                config.getAll(NODE_SECTION, "driver-configuration").ifPresent(drivers::add);
              }

              // iterate over driver configurations
              for (List<String> driver : drivers) {
                Map<String, String> configMap = new HashMap<>();

                // iterate over driver settings
                for (String setting : driver) {
                  // split this setting into key/value pair
                  String[] values = setting.split("=", 2);
                  // if format is invalid
                  if (values.length != 2) {
                    throw new ConfigException(
                        "Driver setting '"
                            + setting
                            + "' does not adhere to the required 'key=value' format!");
                  }
                  // add setting to config
                  configMap.put(values[0], unquote(values[1]));
                }

                // if config lacks settings
                if (configMap.isEmpty()) {
                  throw new ConfigException("Found config delimiter with no preceding settings!");
                }

                // if config lacks 'display-name' setting
                if (!configMap.containsKey("display-name")) {
                  throw new ConfigException(
                      "Found config with no 'display-name' setting! " + configMap);
                }

                // if config lacks 'stereotype' setting
                if (!configMap.containsKey("stereotype")) {
                  throw new ConfigException(
                      "Found config with no 'stereotype' setting! " + configMap);
                }

                // add config to list
                configList.add(configMap);
              }

              // if no configs were found
              if (configList.isEmpty()) {
                throw new ConfigException("No driver configs were found!");
              }

              List<DriverService.Builder<?, ?>> builderList = new ArrayList<>();
              ServiceLoader.load(DriverService.Builder.class).forEach(builderList::add);

              List<WebDriverInfo> infoList = new ArrayList<>();
              ServiceLoader.load(WebDriverInfo.class).forEach(infoList::add);

              // iterate over driver configs
              configList.forEach(
                  thisConfig -> {
                    // create Capabilities object from stereotype of this config
                    Capabilities confStereotype =
                        JSON.toType(thisConfig.get("stereotype"), Capabilities.class);

                    // extract driver executable path from this config
                    String webDriverExecutablePath = thisConfig.get("webdriver-executable");
                    // if executable path is specified
                    if (null != webDriverExecutablePath) {
                      // create File object from executable path string
                      File webDriverExecutable = new File(webDriverExecutablePath);
                      // if specified path isn't a file
                      if (!webDriverExecutable.isFile()) {
                        LOG.warning(
                            "Driver executable does not seem to be a file! "
                                + webDriverExecutablePath);
                      }

                      // if specified path isn't executable
                      if (!webDriverExecutable.canExecute()) {
                        LOG.warning(
                            "Driver file exists but does not seem to be a executable! "
                                + webDriverExecutablePath);
                      }

                      // add specified driver executable path to capabilities
                      confStereotype =
                          new PersistentCapabilities(confStereotype)
                              .setCapability("se:webDriverExecutable", webDriverExecutablePath);
                    }

                    Capabilities stereotype = enhanceStereotype(confStereotype);
                    String configName =
                        thisConfig.getOrDefault("display-name", "Custom Slot Config");

                    WebDriverInfo info =
                        infoList.stream()
                            .filter(webDriverInfo -> webDriverInfo.isSupporting(stereotype))
                            .findFirst()
                            .orElseThrow(
                                () ->
                                    new ConfigException(
                                        "Unable to find matching driver for %s", stereotype));

                    int driverMaxSessions =
                        Integer.parseInt(
                            thisConfig.getOrDefault("max-sessions", String.valueOf(maxSessions)));
                    Require.positive("Driver max sessions", driverMaxSessions);

                    WebDriverInfo driverInfoConfig =
                        createConfiguredDriverInfo(info, stereotype, configName);

                    builderList.stream()
                        .filter(builder -> builder.score(stereotype) > 0)
                        .max(Comparator.comparingInt(builder -> builder.score(stereotype)))
                        .ifPresent(
                            builder -> {
                              ImmutableCapabilities immutable =
                                  new ImmutableCapabilities(stereotype);
                              int maxDriverSessions = getDriverMaxSessions(info, driverMaxSessions);
                              for (int i = 0; i < maxDriverSessions; i++) {
                                driverConfigs.putAll(
                                    driverInfoConfig, factoryFactory.apply(immutable));
                              }
                            });
                  });
            });

    driverConfigs.asMap().entrySet().stream()
        .peek(this::report)
        .forEach(
            entry ->
                sessionFactories.putAll(
                    entry.getKey().getCanonicalCapabilities(), entry.getValue()));
  }

  private void addDetectedDrivers(
      Map<WebDriverInfo, Collection<SessionFactory>> allDrivers,
      ImmutableMultimap.Builder<Capabilities, SessionFactory> sessionFactories) {
    if (!config.getBool(NODE_SECTION, "detect-drivers").orElse(DEFAULT_DETECT_DRIVERS)) {
      return;
    }

    // Only specified drivers should be added, not all the detected ones
    if (config.getAll(NODE_SECTION, "driver-implementation").isPresent()) {
      return;
    }

    allDrivers.entrySet().stream()
        .peek(this::report)
        .forEach(
            entry -> {
              Capabilities capabilities =
                  enhanceStereotype(entry.getKey().getCanonicalCapabilities());
              sessionFactories.putAll(capabilities, entry.getValue());
            });

    if (sessionFactories.build().isEmpty()) {
      String logMessage = "No drivers have been configured or have been found on PATH";
      LOG.warning(logMessage);
      throw new ConfigException(logMessage);
    }
  }

  private void addSpecificDrivers(
      Map<WebDriverInfo, Collection<SessionFactory>> allDrivers,
      ImmutableMultimap.Builder<Capabilities, SessionFactory> sessionFactories) {
    if (config.getAll(NODE_SECTION, "driver-implementation").isEmpty()) {
      return;
    }

    if (!config.getBool(NODE_SECTION, "detect-drivers").orElse(DEFAULT_DETECT_DRIVERS)) {
      String logMessage = "Specific drivers cannot be added if 'detect-drivers' is set to false";
      LOG.warning(logMessage);
      throw new ConfigException(logMessage);
    }

    List<String> drivers =
        config.getAll(NODE_SECTION, "driver-implementation").orElse(new ArrayList<>()).stream()
            .distinct()
            .map(String::toLowerCase)
            .peek(
                driver -> {
                  boolean noneMatch =
                      allDrivers.entrySet().stream()
                          .noneMatch(
                              entry -> entry.getKey().getDisplayName().equalsIgnoreCase(driver));
                  if (noneMatch) {
                    LOG.log(Level.WARNING, "Could not find {0} driver on PATH.", driver);
                  }
                })
            .collect(Collectors.toList());

    Optional<Map.Entry<WebDriverInfo, Collection<SessionFactory>>> first =
        allDrivers.entrySet().stream()
            .filter(entry -> drivers.contains(entry.getKey().getDisplayName().toLowerCase()))
            .findFirst();

    if (first.isEmpty()) {
      throw new ConfigException("No drivers were found for %s", drivers.toString());
    }

    allDrivers.entrySet().stream()
        .filter(entry -> drivers.contains(entry.getKey().getDisplayName().toLowerCase()))
        .sorted(Comparator.comparing(entry -> entry.getKey().getDisplayName().toLowerCase()))
        .peek(this::report)
        .forEach(
            entry -> {
              Capabilities capabilities =
                  enhanceStereotype(entry.getKey().getCanonicalCapabilities());
              sessionFactories.putAll(capabilities, entry.getValue());
            });
  }

  private Map<WebDriverInfo, Collection<SessionFactory>> discoverDrivers(
      int maxSessions, Function<ImmutableCapabilities, Collection<SessionFactory>> factoryFactory) {

    if (!config.getBool(NODE_SECTION, "detect-drivers").orElse(DEFAULT_DETECT_DRIVERS)) {
      return ImmutableMap.of();
    }

    // We don't expect duplicates, but they're fine
    List<WebDriverInfo> infos = new ArrayList<>();
    if (config.getBool(NODE_SECTION, "selenium-manager").orElse(DEFAULT_USE_SELENIUM_MANAGER)) {
      List<WebDriverInfo> driversSM =
          StreamSupport.stream(ServiceLoader.load(WebDriverInfo.class).spliterator(), false)
              .filter(WebDriverInfo::isAvailable)
              .sorted(Comparator.comparing(info -> info.getDisplayName().toLowerCase()))
              .collect(Collectors.toList());
      infos.addAll(driversSM);
    } else {
      LOG.log(Level.INFO, "Looking for existing drivers on the PATH.");
      LOG.log(
          Level.INFO,
          "Add '--selenium-manager true' to the startup command to setup drivers automatically.");
      List<WebDriverInfo> localDrivers =
          StreamSupport.stream(ServiceLoader.load(WebDriverInfo.class).spliterator(), false)
              .filter(WebDriverInfo::isPresent)
              .sorted(Comparator.comparing(info -> info.getDisplayName().toLowerCase()))
              .collect(Collectors.toList());
      infos.addAll(localDrivers);
    }

    // Same
    List<DriverService.Builder<?, ?>> builders = new ArrayList<>();
    ServiceLoader.load(DriverService.Builder.class).forEach(builders::add);

    Multimap<WebDriverInfo, SessionFactory> toReturn = HashMultimap.create();
    infos.forEach(
        info -> {
          Capabilities caps = enhanceStereotype(info.getCanonicalCapabilities());
          builders.stream()
              .filter(builder -> builder.score(caps) > 0)
              .max(Comparator.comparingInt(builder -> builder.score(caps)))
              .ifPresent(
                  builder -> {
                    ImmutableCapabilities immutable = new ImmutableCapabilities(caps);
                    int maxDriverSessions = getDriverMaxSessions(info, maxSessions);
                    for (int i = 0; i < maxDriverSessions; i++) {
                      toReturn.putAll(info, factoryFactory.apply(immutable));
                    }
                  });
        });

    return toReturn.asMap();
  }

  private WebDriverInfo createConfiguredDriverInfo(
      WebDriverInfo detectedDriver, Capabilities canonicalCapabilities, String displayName) {
    return new WebDriverInfo() {
      @Override
      public String getDisplayName() {
        return displayName;
      }

      @Override
      public Capabilities getCanonicalCapabilities() {
        return canonicalCapabilities;
      }

      @Override
      public boolean isSupporting(Capabilities capabilities) {
        return detectedDriver.isSupporting(capabilities);
      }

      @Override
      public boolean isSupportingCdp() {
        return detectedDriver.isSupportingCdp();
      }

      @Override
      public boolean isSupportingBiDi() {
        return detectedDriver.isSupportingBiDi();
      }

      @Override
      public boolean isAvailable() {
        return detectedDriver.isAvailable();
      }

      @Override
      public boolean isPresent() {
        return detectedDriver.isPresent();
      }

      @Override
      public int getMaximumSimultaneousSessions() {
        return detectedDriver.getMaximumSimultaneousSessions();
      }

      @Override
      public Optional<WebDriver> createDriver(Capabilities capabilities)
          throws SessionNotCreatedException {
        return Optional.empty();
      }
    };
  }

  private int getDriverMaxSessions(WebDriverInfo info, int desiredMaxSessions) {
    // Safari and Safari Technology Preview
    if (info.getMaximumSimultaneousSessions() == 1
        && SINGLE_SESSION_DRIVERS.contains(info.getDisplayName().toLowerCase())) {
      return info.getMaximumSimultaneousSessions();
    }
    boolean overrideMaxSessions =
        config.getBool(NODE_SECTION, "override-max-sessions").orElse(OVERRIDE_MAX_SESSIONS);
    if (desiredMaxSessions > info.getMaximumSimultaneousSessions() && overrideMaxSessions) {
      String logMessage =
          String.format(
              "Overriding max recommended number of %s concurrent sessions for %s, setting it to"
                  + " %s",
              info.getMaximumSimultaneousSessions(), info.getDisplayName(), desiredMaxSessions);
      LOG.log(Level.FINE, logMessage);
      return desiredMaxSessions;
    }
    return Math.min(info.getMaximumSimultaneousSessions(), desiredMaxSessions);
  }

  public Capabilities enhanceStereotype(Capabilities capabilities) {
    if (capabilities.getPlatformName() == null) {
      capabilities =
          new PersistentCapabilities(capabilities).setCapability("platformName", CURRENT_PLATFORM);
    }
    if (isVncEnabled()) {
      capabilities =
          new PersistentCapabilities(capabilities)
              .setCapability("se:vncEnabled", true)
              .setCapability("se:noVncPort", noVncPort());
    }
    if (isManagedDownloadsEnabled() && canConfigureDownloadsDir(capabilities)) {
      capabilities =
          new PersistentCapabilities(capabilities).setCapability("se:downloadsEnabled", true);
    }
    return capabilities;
  }

  private boolean canConfigureDownloadsDir(Capabilities caps) {
    return Browser.FIREFOX.is(caps) || Browser.CHROME.is(caps) || Browser.EDGE.is(caps);
  }

  private void report(Map.Entry<WebDriverInfo, Collection<SessionFactory>> entry) {
    StringBuilder caps = new StringBuilder();
    try (JsonOutput out = JSON.newOutput(caps)) {
      out.setPrettyPrint(false);
      Optional<SessionFactory> optionalSessionFactory = entry.getValue().stream().findFirst();
      if (optionalSessionFactory.isPresent()) {
        out.write(optionalSessionFactory.get().getStereotype());
      } else {
        out.write(entry.getKey().getCanonicalCapabilities());
      }
    }

    LOG.info(
        String.format(
            "Adding %s for %s %d times",
            entry.getKey().getDisplayName(),
            caps.toString().replaceAll("\\s+", " "),
            entry.getValue().size()));
  }

  private String unquote(String input) {
    int len = input.length();
    if ((input.charAt(0) == '"') && (input.charAt(len - 1) == '"')) {
      return new Json().newInput(new StringReader(input)).read(Json.OBJECT_TYPE);
    }
    return input;
  }
}
