export function formatFilePath(fileUri: string): string {
  // Decode the URI to get a normal file path
  const decodedUri = decodeURIComponent(fileUri);

  // Remove the "file://" prefix if present
  const filePath = decodedUri.replace(/^file:\/\//, "");

  // Split the file path into parts
  const pathParts = filePath.split("/");

  // Get the last folder and file name
  const fileName = pathParts.pop(); // Get the file name
  const lastFolder = pathParts.pop(); // Get the last folder

  // Return the formatted path
  return `../${lastFolder}/${fileName}`;
}
