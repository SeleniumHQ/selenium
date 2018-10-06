import java.io.*;

public class StringSplitTest {
	public static void main(String[] args) throws Exception {
		BufferedReader reader = new BufferedReader(
		    new InputStreamReader(System.in));
		String line;

		while ((line = reader.readLine()) != null) {
			if (line.length() == 0 || line.charAt(0) == '#') {
				System.out.println(line);
				continue;
			}

			String[] parts = line.split(";", 3);
			if (parts.length != 3) {
				System.out.println("line garbled: " + line);
				continue;
			}

			int limit = Integer.valueOf(parts[0]);
			String[] result = parts[2].split(parts[1], limit);
			if (result.length > 0) {
				System.out.print(result[0]);
				for (int i = 1; i < result.length; i++)
					System.out.print(";" + result[i]);
			}
			System.out.println();
		}
	}
}
