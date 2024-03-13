import React from "react"
import './styles/App.css'
import DragFiles from "./components/DragFile";

function App() {
  const dateTime = new Date()

  return (
    <div className="Page">
      <header>
        <h1>Converter Files</h1>
      </header>
      <p>
        This is a free online service for changing the format of your media files without losing the quality.
      </p>
      <ol type="1">
        <li>Select the format you need to reformat your files in the block below.</li>
        <li>Click on the block below to select the files that you need to reformat or drag
          the files into the block below, after which the automatic reformatting of your files
          will begin. This may take up to 1 minute of your time.
        </li>
      </ol>
      <DragFiles />
      <h2>Why should you reformat some file formats?</h2>
      <p>
        You may need to reformat some files for programs for certain reasons:
      </p>
      <ul>
        <li>
          Compatibility: Some programs may only support certain file formats. If your file is in a different format,
          you will need to reformat it before the program can read or process it.
        </li>
        <li>
          Optimization: Sometimes the file format may not be the most optimal for the purposes you want to achieve.
          Reformatting allows you to optimize a file for more efficient work with it within the program.
        </li>
        <li>
          Functionality: Some file formats may support more features or functionality than others. Reformatting may
          be necessary in order to take advantage of certain program features.
        </li>
        <li>
          Standardization: If you work in a team or shared environment, it may make sense to reformat your files to
          maintain standards and overall compatibility.
        </li>
        <li>
          Data Processing: Sometimes reformatting files may be necessary to analyze, process, or transfer them to other programs.
        </li>
      </ul>
      <h2>Is it safe to convert your files?</h2>
      <p>
        It is totally safe to use our tool to convert your files. Your original file remains untouched on your phone,
        tablet, or computer, so you can always go back to the original if the converted file doesn’t work for you.
        <br /><br />
        Also, our server deletes all uploads and conversions after one hour. This ensures your sensitive information
        stays safe. You never need to worry about your files staying on our server for more than one hour!
      </p>
      <footer>
        <p>All uploaded data is deleted after 1 hour.</p>
        <p>© Anonymous {dateTime.getFullYear()}</p>
      </footer>
    </div>
  )
}

export default App;