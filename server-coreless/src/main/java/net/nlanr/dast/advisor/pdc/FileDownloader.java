package net.nlanr.dast.advisor.pdc; 

import java.net.URL;
import java.net.HttpURLConnection;
import java.io.File;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.FileOutputStream;
import org.apache.tools.ant.util.FileUtils;

/**
 * The FileDownloader class downloads a plain files from a given server.
 *
 * @author Steven Ko
 */
public class FileDownloader {
    /** Name of the server */
    private static String server = null;

    /**
     * Constructor
     *
     * @param name String spec of the server
     */
    public FileDownloader(String name) {
        this.server = name;
    }

    /**
     * Downloads a file from the given url and writes to the output file.
     *
     * @param url Url of the server
     * @param output Output file
     * @return Output file
     * @throws Exception on every exception
     */
    public static File getFile(URL url, String output)
        throws Exception {
        File outputFile = null;
        int b = 0;

        try {
            HttpURLConnection connection =
                (HttpURLConnection) url.openConnection();
            BufferedInputStream in = new BufferedInputStream(
                    connection.getInputStream());
            outputFile = FileUtils.getFileUtils().createTempFile("se-",".file",null);
            BufferedOutputStream out = new BufferedOutputStream(
                    new FileOutputStream(outputFile));
            String temp = null;

            while ((b = in.read()) != -1) {
                out.write(b);
            }
            out.flush();
            in.close();
            out.close();
        } catch (Exception e) {
            throw new Exception(e);
        }

        return outputFile;
    }

    /**
     * If fileName contains "http://", this method downloads directly from
     * that server. Otherwise, it downloads the file from the server
     * specified when creating the instance of this class.
     *
     * @param fileName String of file name
     * @return Output file
     * @throws Exception on every exception
     */
    public static File getFile(String fileName) throws Exception {
        String path = null;
        String outputFile = null;
        URL url = null;

        if (fileName == null) {
            throw new Exception("No given file name");
        } else if (fileName.startsWith("http://")) {
            path = fileName;
            outputFile = fileName.substring(fileName.lastIndexOf('/') + 1);
        } else {
            if (server == null) {
                throw new Exception("No given server name");
            }
            path = server + "/" + fileName;
            outputFile = fileName;
        }

        try {
            url = new URL(path);
        } catch (Exception e) {
            throw new Exception(e);
        }

        return getFile(url, outputFile);
    }
}
