/**
 * Decorates a real Selenium object to add some convenient behaviors.
 */
package com.thoughtworks.selenium

class GroovySelenium /* implements Selenium */ {
    def selenium
    def defaultTimeout
    def captureScreenShotOnFailure
    def screenShotDir
    def generator
    def screenShotCounter
    
    GroovySelenium(Selenium selenium) {
        this.selenium = selenium
        defaultTimeout = 60000
        captureScreenShotOnFailure = false
        screenShotDir = new File('.')
        generator = this
        screenShotCounter = 0
        
        instrumentSeleniumWithAndWait()
    }
    
    /**
     * Adds "*AndWait" methods to the DefaultSelenium metaclass. New methods
     * are added for any API methods that do not begin with "is", "get", or
     * "waitFor".
     */
    private void instrumentSeleniumWithAndWait() {
        DefaultSelenium.class.methods.each { method ->
            def name = method.getName()
            if (name =~ /^(is|get|waitFor)/) {
                return
            }
            
            def newName = "${name}AndWait"
            if (DefaultSelenium.metaClass."${newName}" instanceof Closure) {
                return
            }
            
            switch (method.getParameterTypes().length) {
                case 0:
                    DefaultSelenium.metaClass."${newName}" = {
                        delegate."${name}"()
                        delegate.waitForPageToLoad("${defaultTimeout}")
                    }
                    break
                case 1:
                    DefaultSelenium.metaClass."${newName}" = { a ->
                        delegate."${name}"(a)
                        delegate.waitForPageToLoad("${defaultTimeout}")
                    }
                    break
                case 2:
                    DefaultSelenium.metaClass."${newName}" = { a, b ->
                        delegate."${name}"(a, b)
                        delegate.waitForPageToLoad("${defaultTimeout}")
                    }
                    break
            }
        }
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
     * application whenever a Selenium command fails.
     *
     * @param capture
     */
    void setCaptureScreenShotOnFailure(boolean capture) {
        captureScreenShotOnFailure = capture
    }
    
    /**
     * Sets the directory in which screenshots will be generated.
     *
     * @param dir
     */
    void setScreenShotDir(File dir) {
        screenShotDir = dir
    }
    
    /**
     * Sets the logic used to generate screenshot filenames. The name of the
     * failed command is passed into the generator.
     *
     * @param generator  an object with a generate() method, which returns a
     *                   String representing a file name. See the generate
     *                   method for this class as an example.
     */
    void setScreenShotFileNameGenerator(generator) {
        this.generator = generator
    }
    
    private String generate(File screenShotDir, String command) {
        def prefix = "${++screenShotCounter}".padLeft(4, '0') + "_${command}"
        def suffix = '.png'
        def file = new File(screenShotDir, "${prefix}${suffix}")
        def clobberCounter = 1
        
        while (file.exists()) {
            suffix = "-${++clobberCounter}.png"
            file = new File(screenShotDir, "${prefix}${suffix}")
        }
        
        return file.getCanonicalPath()
    }
    
    /**
     * Called when a Selenium command fails. The Selenium object is passed in.
     *
     * @param selenium
     * @param args
     */
    private void postFailure(selenium, String command) {
        if (captureScreenShotOnFailure) {
            def fileName = generator.generate(screenShotDir, command)
            
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
    }
    
    /**
     * Delegates missing method calls to the wrapped Selenium object where
     * possible.
     *
     * @param name
     * @param args
     */
    def methodMissing(String name, args) {
        try {
            switch (args.size()) {
                case 0: return selenium."${name}"()
                case 1: return selenium."${name}"(args[0])
                case 2: return selenium."${name}"(args[0], args[1])
            }
        }
        catch (e) {
            if (! (e instanceof MissingMethodException)) {
                postFailure(selenium, name)
            }
            throw e
        }
    }
}
