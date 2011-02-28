/*
 * Created on Oct 17, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import static org.openqa.selenium.browserlaunchers.LauncherUtils.getSeleniumResourceAsStream;

import com.google.common.io.ByteStreams;
import com.google.common.io.Closeables;
import com.google.common.io.Resources;

import org.openqa.selenium.browserlaunchers.LauncherUtils;
import org.openqa.selenium.io.FileHandler;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Enumeration;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;


public class ResourceExtractor {
    private static Logger log = Logger.getLogger(ResourceExtractor.class.getName());

    public static File extractResourcePath(Class cl, String resourcePath, File dest)
            throws IOException {
        boolean alwaysExtract = true;

        URL url = Resources.getResource(cl, resourcePath);
        if ("jar".equalsIgnoreCase(url.getProtocol())) {
            File jarFile = getJarFileFromUrl(url);
            extractResourcePathFromJar(cl, jarFile, resourcePath, dest);
        } else {
            try {
                File resourceFile = new File(new URI(url.toExternalForm()));
                if (!alwaysExtract) {
                    return resourceFile;
                }
                if (resourceFile.isDirectory()) {
                    LauncherUtils.copyDirectory(resourceFile, dest);
                } else {
                    FileHandler.copy(resourceFile, dest);
                }
            } catch (URISyntaxException e) {
                throw new RuntimeException("Couldn't convert URL to File:" + url, e);
            }
        }
        return dest;
    }
    
    private static void extractResourcePathFromJar(Class cl, File jarFile, String resourcePath, File dest) throws IOException {
        ZipFile z = new ZipFile(jarFile, ZipFile.OPEN_READ);
        String zipStyleResourcePath = resourcePath.substring(1) + "/"; 
        ZipEntry ze = z.getEntry(zipStyleResourcePath);
        log.fine( "Extracting "+resourcePath+" to " + dest.getAbsolutePath() );
        if (ze != null) {
            // DGF If it's a directory, then we need to look at all the entries
            for (Enumeration entries = z.entries(); entries.hasMoreElements();) {
                ze = (ZipEntry) entries.nextElement();
                if (ze.getName().startsWith(zipStyleResourcePath)) {
                    String relativePath = ze.getName().substring(zipStyleResourcePath.length());
                    File destFile = new File(dest, relativePath);
                    if (ze.isDirectory()) {
                        destFile.mkdirs();
                    } else {
                        FileOutputStream fos = new FileOutputStream(destFile);
                        copyStream(z.getInputStream(ze), fos);
                    }
                }
            }
        } else {
            FileOutputStream fos = new FileOutputStream(dest);
            copyStream(getSeleniumResourceAsStream(resourcePath), fos);
            
        }
    }

  public static void traceWith(Logger log) {
    ResourceExtractor.log = log;
  }

  private static File getJarFileFromUrl(URL url) {
        if (!"jar".equalsIgnoreCase(url.getProtocol()))
            throw new IllegalArgumentException("This is not a Jar URL:"
                    + url.toString());
        String resourceFilePath = url.getFile();
        int index = resourceFilePath.lastIndexOf("!");
        if (index == -1) {
            throw new RuntimeException("Bug! " + url.toExternalForm()
                    + " does not have a '!'");
        }
        String jarFileURI = resourceFilePath.substring(0, index).replace(" ", "%20");
        try {
            File jarFile = new File(new URI(jarFileURI));
            return jarFile;
        } catch (URISyntaxException e) {
            throw new RuntimeException("Bug! URI failed to parse: " + jarFileURI, e);
        }

    }
    
    private static void copyStream(InputStream in, OutputStream out) throws IOException {
        try {
          ByteStreams.copy(in, out);
        } finally {
          Closeables.close(out, true);
          Closeables.close(in, true);
        }
    }
}
