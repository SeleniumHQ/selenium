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

    private static Handler[] originalHandlers;
    private static Map<Handler, Formatter> originalFormatters;
    private static Map<Handler, Level> originalLogLevels;
    private static Map<File, FileHandler> seleniumFileHandlers = new HashMap<File, FileHandler>();
    private static ShortTermMemoryHandler shortTermMemoryHandler;

    
    public static synchronized Log configureLogging(RemoteControlConfiguration configuration, boolean debugMode) {
        final Log seleniumServerJettyLogger;
        final Logger currentLogger;

        if (configuration.dontTouchLogging()) {
            return LogFactory.getLog(SeleniumServer.class);
        }

        currentLogger = Logger.getLogger("");
        resetLoggerToOriginalState();
        overrideSimpleFormatterWithTerseOneForConsoleHandler(currentLogger, debugMode);
        addInMemoryLogger(currentLogger, configuration);
        if (debugMode) {
            currentLogger.setLevel(Level.FINE);
        }

        seleniumServerJettyLogger = LogFactory.getLog(SeleniumServer.class);
        if (null != configuration.getLogOutFile()) {
            addNewSeleniumFileHandler(currentLogger, configuration);
            seleniumServerJettyLogger.info("Writing debug logs to " + configuration.getLogOutFile());
        }

        return seleniumServerJettyLogger;
    }

    public static synchronized ShortTermMemoryHandler shortTermMemoryHandler() {
        return shortTermMemoryHandler;
    }
    
    private static void addInMemoryLogger(Logger logger, RemoteControlConfiguration configuration) {
        shortTermMemoryHandler = new ShortTermMemoryHandler(configuration.shortTermMemoryLoggerCapacity(), Level.INFO);
        logger.addHandler(shortTermMemoryHandler);
    }

    private static File addNewSeleniumFileHandler(Logger currentLogger, RemoteControlConfiguration configuration) {
        try {
            FileHandler fileHandler;
            final File logFile;

            logFile = configuration.getLogOutFile();
            fileHandler = seleniumFileHandlers.get(logFile);
            if (fileHandler == null) {
                fileHandler = registerNewSeleniumFileHandler(logFile);
            }
            fileHandler.setFormatter(new TerseFormatter(true));
            currentLogger.setLevel(Level.FINE);
            fileHandler.setLevel(Level.FINE);
            currentLogger.addHandler(fileHandler);
            return logFile;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private static FileHandler registerNewSeleniumFileHandler(File logFile) throws IOException {
        FileHandler fileHandler;
        fileHandler = new FileHandler(logFile.getAbsolutePath());
        seleniumFileHandlers.put(logFile, fileHandler);
        return fileHandler;
    }

    public static void overrideSimpleFormatterWithTerseOneForConsoleHandler(Logger logger, boolean debugMode) {
        for (Handler handler : logger.getHandlers()) {
            if (handler instanceof ConsoleHandler) {
                final Formatter formatter;

                formatter = handler.getFormatter();
                if (formatter instanceof SimpleFormatter) {
                    final StdOutHandler stdOutHandler;
                    final Level originalLevel;

                    /*
                     * DGF - Nobody likes the SimpleFormatter; surely they
                     * wanted our terse formatter instead.
                     */
                    originalLevel = handler.getLevel();
                    handler.setFormatter(new TerseFormatter(false));
                    handler.setLevel(Level.WARNING);

                    /*
                     * Furthermore, we all want DEBUG/INFO on stdout and WARN/ERROR on stderr
                     */
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


    protected static void resetLoggerToOriginalState() {
        final Logger logger;
        
        logger = Logger.getLogger("");
        if (originalHandlers == null) {
            saveOriginalHandlersFormattersAndLevels(logger);
        } else {
            restoreOriginalHandlersFormattersAndLevels(logger);
        }
    }

    
    protected static void restoreOriginalHandlersFormattersAndLevels(Logger logger) {
        for (Handler handler : logger.getHandlers()) {
            logger.removeHandler(handler);
        }
        for (Handler handler : originalHandlers) {
            logger.addHandler(handler);
            handler.setFormatter(originalFormatters.get(handler));
            handler.setLevel(originalLogLevels.get(handler));
        }
    }


    protected static void saveOriginalHandlersFormattersAndLevels(Logger logger) {
        originalHandlers = logger.getHandlers();
        originalFormatters = new HashMap<Handler, Formatter>();
        originalLogLevels = new HashMap<Handler, Level>();
        for (Handler handler : originalHandlers) {
            originalFormatters.put(handler, handler.getFormatter());
            originalLogLevels.put(handler, handler.getLevel());
        }
    }

    
}
