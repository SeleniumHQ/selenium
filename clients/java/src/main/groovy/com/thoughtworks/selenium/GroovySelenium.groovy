/**
 * Decorates a real Selenium object to add some convenient behaviors.
 * Additional behaviors can be added by extending this class and extending or
 * overriding postSuccess() and postFailure().
 */
package com.thoughtworks.selenium

import java.util.regex.Pattern

class GroovySelenium /* implements Selenium */ {
    static final PATTERN_AND_WAIT = Pattern.compile(/^(.+)AndWait$/)
    
    def selenium
    def defaultTimeout
    def alwaysCaptureScreenshots
    def captureScreenshotOnFailure
    def screenshotDir
    def generator
    def screenshotCounter
    
    GroovySelenium(Selenium selenium) {
        this.selenium = selenium
        defaultTimeout = 60000
        alwaysCaptureScreenshots = false
        captureScreenshotOnFailure = false
        screenshotDir = new File('.')
        generator = this
        screenshotCounter = 0
    }
    
    /**
     * Sets the timeout used when waiting for pages to load.
     *
     * @param timeout  in milliseconds
     */
    void setDefaultTimeout(int timeout) {
        defaultTimeout = timeout
    }
    
    /**
     * If true is passed in, we will attempt to capture a screenshot of the
     * application whenever a Selenium command finishes, whether it failed or
     * not.
     *
     * @param capture
     */
    void setAlwaysCaptureScreenshots(boolean capture) {
        alwaysCaptureScreenshots = capture
    }
    
    /**
     * If true is passed in, we will attempt to capture a screenshot of the
     * application whenever a Selenium command fails.
     *
     * @param capture
     */
    void setCaptureScreenshotOnFailure(boolean capture) {
        captureScreenshotOnFailure = capture
    }
    
    /**
     * Sets the directory in which screenshots will be generated.
     *
     * @param dir
     */
    void setScreenshotDir(File dir) {
        screenshotDir = dir
    }
    
    /**
     * Sets the logic used to generate screenshot filenames. The name of the
     * failed command is passed into the generator.
     *
     * @param generator  an object with a generate() method, which returns a
     *                   String representing a file name. See the generate
     *                   method for this class as an example.
     */
    void setScreenshotFileNameGenerator(generator) {
        this.generator = generator
    }
    
    protected String generate(File screenshotDir, String label) {
        def prefix = "${++screenshotCounter}".padLeft(4, '0') + "_${label}"
        def suffix = '.png'
        def file = new File(screenshotDir, "${prefix}${suffix}")
        def clobberCounter = 1
        
        while (file.exists()) {
            suffix = "-${++clobberCounter}.png"
            file = new File(screenshotDir, "${prefix}${suffix}")
        }
        
        return file.getCanonicalPath()
    }
    
    /**
     * Called when a Selenium command succeeds. The Selenium object is passed
     * in.
     *
     * @param selenium  the selenium instance
     * @param command   the name of the command that succeeded
     */
    protected void postSuccess(selenium, String command) {
        if (alwaysCaptureScreenshots) {
            captureScreenshot(command)
        }
    }
    
    /**
     * Called when a Selenium command fails. The Selenium object is passed in.
     *
     * @param selenium  the selenium instance
     * @param command   the name of the command that failed
     */
    protected void postFailure(selenium, String command) {
        if (alwaysCaptureScreenshots || captureScreenshotOnFailure) {
            captureScreenshot(command)
        }
    }
    
    /**
     * Captures a screenshot using the wrapped Selenium instance.
     *
     * @param label  an identifying label to include in the name of the created
     *               screenshot
     */
    void captureScreenshot(String label) {
        def fileName = generator.generate(screenshotDir, label)
        
        try {
            selenium.captureEntirePageScreenshot(fileName, "")
            println "Saved entire-page screenshot: ${fileName}"
        }
        catch (e) {
            try {
                selenium.captureScreenshot(fileName)
                println "Saved screenshot: ${fileName}"
            }
            catch (f) {
                println "Could not save screenshot ${fileName}: " +
                    f.getMessage()
                f.printStackTrace()
            }
        }
    }
    
    /**
     * Delegates missing method calls to the wrapped Selenium object where
     * possible.
     *
     * @param name
     * @param args
     */
    def methodMissing(String name, args) {
        def command = name
        def isAndWait = false
        def matcher = (name =~ PATTERN_AND_WAIT)
        
        if (matcher.find()) {
            command = matcher.group(1)
            isAndWait = true
        }
        
        try {
            def result
            switch (args.size()) {
                case 0:
                    result = selenium."${command}"()
                    break
                case 1:
                    result = selenium."${command}"(args[0])
                    break
                case 2:
                    result = selenium."${command}"(args[0], args[1])
                    break
            }
            
            if (isAndWait) {
                selenium.waitForPageToLoad("${defaultTimeout}")
            }
            
            postSuccess(selenium, name)
            return result
        }
        catch (e) {
            if (! (e instanceof MissingMethodException)) {
                postFailure(selenium, name)
            }
            throw e
        }
    }
}
