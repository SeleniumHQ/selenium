package org.openqa.selenium.server.log;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.*;

/**
 * Configure logging to Selenium taste.
 */
public class LoggingManager {

    private static Map<Handler, Formatter> defaultFormatters;
    private static Map<Handler, Level> defaultLevels;
    private static Map<File, FileHandler> seleniumFileHandlers = new HashMap<File, FileHandler>();
    private static Handler[] defaultHandlers;    

    public static synchronized Log configureLogging(RemoteControlConfiguration configuration, boolean debugMode) {
        final Logger logger;
        final Log seleniumServerLogger;

        if (configuration.dontTouchLogging()) {
            return LogFactory.getLog(SeleniumServer.class);
        }

        logger = Logger.getLogger("");
        resetLogger();
        LoggingManager.overrideSimpleFormatterWithTerseConsoleLogger(logger, debugMode);

        if (debugMode) {
            logger.setLevel(Level.FINE);
        }

        seleniumServerLogger = LogFactory.getLog(SeleniumServer.class);
        if (null == configuration.getLogOutFileName() && System.getProperty("selenium.LOGGER") != null) {
            configuration.setLogOutFileName(System.getProperty("selenium.LOGGER"));
        }
        if (null != configuration.getLogOutFile()) {
            try {
                File logFile = configuration.getLogOutFile();
                FileHandler fileHandler = seleniumFileHandlers.get(logFile);
                if (fileHandler == null) {
                    fileHandler = new FileHandler(logFile.getAbsolutePath());
                    seleniumFileHandlers.put(logFile, fileHandler);
                }
                fileHandler.setFormatter(new TerseFormatter(true));
                logger.setLevel(Level.FINE);
                fileHandler.setLevel(Level.FINE);
                logger.addHandler(fileHandler);
                seleniumServerLogger.info("Writing debug logs to " + logFile.getAbsolutePath());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        return seleniumServerLogger;
    }

    public static void overrideSimpleFormatterWithTerseConsoleLogger(Logger logger, boolean debugMode) {
        for (Handler handler : logger.getHandlers()) {
            if (handler instanceof ConsoleHandler) {
                final Formatter formatter;

                formatter = handler.getFormatter();
                if (formatter instanceof SimpleFormatter) {
                    final StdOutHandler stdOutHandler;
                    final Level originalLevel;

                    /*
                     * DGF Nobody likes the SimpleFormatter; surely they
                     * wanted our terse formatter instead.
                     * Furthermore, we all want DEBUG/INFO on stdout and WARN/ERROR on stderr
                     */
                    originalLevel = handler.getLevel();
                    handler.setFormatter(new TerseFormatter(false));
                    handler.setLevel(Level.WARNING);
                    stdOutHandler = new StdOutHandler();
                    stdOutHandler.setFormatter(new TerseFormatter(false));
                    stdOutHandler.setFilter(new MaxLevelFilter(Level.INFO));
                    stdOutHandler.setLevel(originalLevel);
                    logger.addHandler(stdOutHandler);
                    if (debugMode) {
                        if (originalLevel.intValue() > Level.FINE.intValue()) {
                            stdOutHandler.setLevel(Level.FINE);
                        }
                    }
                }
            }
        }
    }

    protected static void resetLogger() {
        Logger logger = Logger.getLogger("");
        if (defaultHandlers == null) {
            defaultHandlers = logger.getHandlers();
            defaultFormatters = new HashMap<Handler, Formatter>();
            defaultLevels = new HashMap<Handler, Level>();
            for (Handler handler : defaultHandlers) {
                defaultFormatters.put(handler, handler.getFormatter());
                defaultLevels.put(handler, handler.getLevel());
            }
        } else {
            for (Handler handler : logger.getHandlers()) {
                logger.removeHandler(handler);
            }
            for (Handler handler : defaultHandlers) {
                logger.addHandler(handler);
                handler.setFormatter(defaultFormatters.get(handler));
                handler.setLevel(defaultLevels.get(handler));
            }
        }

    }

}
