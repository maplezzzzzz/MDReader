[English](README-en.md)  [中文](README.md)

# Markdown 编辑器
利用AI辅助制作的Markdown编辑器，支持实时预览、语法高亮、快捷键、文件导入导出、多文件管理、多主题切换、历史记录、自动保存、AI辅助等功能。

目前还是MVP版本，这只是用于演示AI可以帮助我们进行软件开发，更多功能正在设计和开发中，后续会逐步完善。

## 基本信息
本项目使用 [Electron](https://www.electronjs.org/) 和 [Vue](https://vuejs.org/) 开发一个简单的 Markdown 编辑器，旨在提供一个轻量级的桌面应用，方便用户进行 Markdown 文档的编辑和预览。

#### 工程目录：
```
MDReader/
├── libs/                  # 第三方库
├── webfonts/              # 字体文件
├── index.html             # 主页面
├── main.js               # 主进程
├── preload.js            # 预加载脚本
├── renderer.js           # 渲染进程
├── style.css             # 样式文件
├── package.json          # 项目配置
├── node_modules/         # 依赖包
├── dist/                 # 编译输出目录
└── README.md             # 项目说明文件
```

## 编译打包
### 配置打包信息，在 `package.json` 中：
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

- `--platform=darwin`：指定打包为 macOS 应用，也可以是 `win32`（Windows 系统）。
- `--arch=arm64`：指定为 Apple Silicon (M1/M2) 架构打包。如果您需要为英特尔架构打包，可以使用 `x64`。
- `--out=dist/`：指定输出目录。
- `--overwrite`：如果输出目录中已有内容，则覆盖它。

### 安装依赖
首先，您需要安装 Electron 和 electron-packager。请在项目根目录下运行以下命令：
```bash
npm install electron --save-dev
npm install electron-packager --save-dev
```

### 编译打包
运行以下命令开始编译打包：
```bash
npm run build
```

## 如何运行
在项目根目录下运行以下命令启动应用：
```bash
npm start
```

## 贡献
欢迎您提交问题和建议，也欢迎您直接为项目贡献代码！

## 许可证
本项目使用 [MIT License](LICENSE) 许可协议。
```

希望这个模板能够满足您的需求！您可以根据具体的项目结构和功能添加更多详细信息。
