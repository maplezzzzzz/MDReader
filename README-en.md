# MDReader
A Markdown editor created with the assistance of AI, supporting real-time preview, syntax highlighting, keyboard shortcuts, file import/export, multi-file management, theme switching, history records, auto-save, and AI assistance features.

Currently, this is still the MVP version, intended to demonstrate how AI can help us in software development, with more features being designed and developed, and improvements will be made gradually.

## Basic Information
This project uses [Electron](https://www.electronjs.org/) and [Vue](https://vuejs.org/) to develop a simple Markdown editor, aiming to provide a lightweight desktop application that allows users to edit and preview Markdown documents easily.

#### Project Directory:
```
MDReader/
├── libs/                  # Third-party libraries
├── webfonts/              # Font files
├── index.html             # Main page
├── main.js                # Main process
├── preload.js             # Preload script
├── renderer.js            # Render process
├── style.css              # Style file
├── package.json           # Project configuration
├── node_modules/          # Dependency packages
├── dist/                  # Compilation output directory
└── README.md              # Project description file
```

## Build and Package
### Configure packaging information in `package.json`:
```json
{
  "name": "markdown-editor",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-packager . MarkdownEditor --platform=darwin --arch=arm64 --out=dist/ --overwrite"
  },
  "dependencies": {
    "electron": "^latest"
  },
  "devDependencies": {
    "electron-packager": "^latest"
  }
}
```

- `--platform=darwin`: Specifies that the packaging is for macOS applications; it can also be `win32` (for Windows).
- `--arch=arm64`: Specifies that the packaging is for Apple Silicon (M1/M2) architecture. If you need to package for Intel architecture, you can use `x64`.
- `--out=dist/`: Specifies the output directory.
- `--overwrite`: If there is content in the output directory, it will be overwritten.

### Install Dependencies
First, you need to install Electron and electron-packager. Please run the following command in the project's root directory:
```bash
npm install electron --save-dev
npm install electron-packager --save-dev
```

### Build and Package
Run the following command to start the build and package process:
```bash
npm run build
```

## How to Run
Run the following command in the project's root directory to start the application:
```bash
npm start
```

## Contributing
You are welcome to submit issues and suggestions, and you are also encouraged to contribute directly to the project!

## License
This project is licensed under the [MIT License](LICENSE).