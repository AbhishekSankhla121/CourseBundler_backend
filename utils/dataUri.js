import DataURIParser from "datauri/parser.js";// Import the DataURI parser library
import path from "path"// Import the path library

// Function to convert a file buffer to a DataURI
const getDataUri = (file) => {
    const parser = new DataURIParser();// Create a new DataURI parser instance
    const extName = path.extname(file.originalname).toString();// Get the file extension
    console.log(extName)
    return parser.format(extName, file.buffer);// Format the file buffer to DataURI

}

export default getDataUri;