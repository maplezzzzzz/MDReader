// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const MarkdownIt = require('markdown-it');
const markdownItFootnote = require('markdown-it-footnote');
const hljs = require('highlight.js');
const fs = require('fs').promises;

const md = new MarkdownIt({
    html: true,
    xhtmlOut: true,
    breaks: true,
    langPrefix: 'language-',
    linkify: true,
    typographer: true,
    quotes: '“”‘’',
    highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) { }
            return ''; // use external default escaping
        }
        return ''; // no highlighting
    }
})
.use(require('markdown-it-sub'))
.use(require('markdown-it-sup'))
// .use(require('markdown-it-emoji'))
.use(require('markdown-it-task-lists'))
.use(require('markdown-it-footnote'))
.use(require('markdown-it-deflist'))
.use(require('markdown-it-abbr'))
.use(require('markdown-it-ins'))
.use(require('markdown-it-mark'));

// 暴露 api 对象
contextBridge.exposeInMainWorld('api', {
    marked: (text) => md.render(text), // 解析 Markdown
    send: (channel, data) => {
        // 限制可用的频道
        let validChannels = ['request-open-file', 'file-opened'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ['file-opened'];
        if (validChannels.includes(channel)) {
            // 在接收到时调用接收的函数
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});
// 暴露 API 以打开文件和文件夹
contextBridge.exposeInMainWorld('file', {
    marked: (text) => md.render(text),
    openFile: async () => await ipcRenderer.invoke('dialog:openFile'), // 请求打开文件
    openFolder: async () => await ipcRenderer.invoke('dialog:openFolder'), // 请求打开文件夹
    readFile: async (filePath) => {
        try {
          return await fs.readFile(filePath, 'utf-8'); // 读取文件内容
        } catch (error) {
          console.error('Error reading file:', error);
          throw error; // 抛出错误以供处理
        }
    },
});
