const app = new Vue({
    el: '#preview',
    data: {
        markdownText: '',
    },
    watch: {
        markdownText(newText) {
            this.updatePreview(newText);
        },
    },
    methods: {
        updatePreview(text) {
            let markdownText = editor.innerText; // 获取编辑框内容
            markdownText = changImagePath(markdownText); // 替换图片路径

            const html = window.api.marked(markdownText); // 使用 API 渲染 Markdown
            document.getElementById('preview').innerHTML = html; // 更新预览内容

            // codeLineNumbers(); // 添加行号
            codeLineHight(); // 高亮代码块
            // 初始化 Mermaid 图
            mermaid.init(); // 确保 mermaid 重新渲染图表
        },
    },
});

//-------全局变量------
let isSyncing = false;      // 状态变量
let currentFilePath = "";   // 存储当前打开的文件路径
let currentHighlight = null; // 当前高亮行

//-------获取元素------
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const contextMenu = document.getElementById('contextMenu');
// const openFileButton = document.getElementById('openFile');
// const openFolderButton = document.getElementById('openFolder');
const EditerOpenFileButton = document.getElementById('openFileButton');



//------监听事件--------

// 处理编辑框的滚动事件
editor.addEventListener('scroll', onEditorScroll);
// 处理预览框的滚动事件
preview.addEventListener('scroll', onPreviewScroll);

// 处理 Tab 键
editor.addEventListener('keydown', onEditorEnterTab);
// 处理鼠标悬浮高亮
editor.addEventListener('mousemove', onMouseOnHighlight);
// 处理输入框内容的变化
editor.addEventListener('input', onInputText);
// 处理粘贴事件，确保仅粘贴纯文本
editor.addEventListener('paste', handlerPasteText);
// 打开文件的功能
// openFileButton.addEventListener('click', openFile);
EditerOpenFileButton.addEventListener('click', openFile);
// 打开文件夹的功能
// openFolderButton.addEventListener('click', openFolder);
// 点击其他地方隐藏菜单
window.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});




//-------功能实现-------
function codeLineHight() {
    // 移除之前的高亮
    const codeBlocks = preview.querySelectorAll('pre code'); // 获取所有代码块
    codeBlocks.forEach((block) => {
        hljs.highlightBlock(block); // 应用高亮
    });
}

function codeLineNumbers() {
    // 添加行号到代码块
    const codeBlocks = document.querySelectorAll('#preview pre>code'); // 获取所有代码块
    codeBlocks.forEach(block => {
        const lines = block.innerHTML.split('\n'); // 按行分割
        const lineNumberHtml = lines.map((line, index) => `<span class="line-number">${index + 1}</span>${line}`).join('\n'); // 为每行添加行号
        block.innerHTML = lineNumberHtml; // 更新代码块的内容
    });
}

// 处理图片路径，替换为绝对路径
function changImagePath(text) {
    // 使用正则表达式来查找 ![alt](path) 格式的图片引用
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const processedText = text.replace(imageRegex, (match, altText, path) => {
        console.log(`Matched: ${match}, Alt Text: ${altText}, Path: ${path}`); // 输出调试信息
        if (path.startsWith('http://') ||
            path.startsWith('https://') ||
            path.startsWith('ftp://') ||
            path.startsWith('/')) {
                return match;   // 如果路径是完整的，则不做处理
            }

        // 检查 currentFilePath 是否有效
        if (!currentFilePath) {
            console.error("currentFilePath 为空或无效，返回原始地址");
            return match; // 如果无效，返回原始匹配内容
        }

        try {
            // 提取并编码文件夹路径
            const folderPath = currentFilePath.substring(0, currentFilePath.lastIndexOf('/')); // 获取目录路径
            // 使用 URL 来处理路径，构建绝对路径并编码
            const imagePath = new URL(decodeURIComponent(path), `file://${folderPath}/`).href.replace("file://", "");
            // 返回处理后的字符串
            return `![${altText}](${imagePath})`;
        } catch (error) {
            console.error("Error creating URL:", error);
            return match; // 如果出错，返回原始匹配内容
        }
    });
    return processedText;
}

// 滚动同步
function syncScroll(source, target) {
    const scrollPercentage = source.scrollTop / (source.scrollHeight - source.clientHeight);
    target.scrollTop = scrollPercentage * (target.scrollHeight - target.clientHeight);
}

// 定义scroll事件的处理函数
function onEditorScroll() {
    if (!isSyncing) {
        isSyncing = true; // 开始同步
        syncScroll(editor, preview); // 同步左侧编辑框到预览框
        setInterval(() => {
            isSyncing = false; // 结束同步
        }, 10);
    }
}

// 定义scroll事件的处理函数
function onPreviewScroll() {
    if (!isSyncing) {
        isSyncing = true; // 开始同步
        syncScroll(preview, editor); // 同步右侧预览框到编辑框
        setInterval(() => {
            isSyncing = false; // 结束同步
        }, 10);
    }
}


// 处理 Tab 键
function onEditorEnterTab(e) {
    // 处理 Shift + Tab 键
    if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const text = editor.value;
        //向前缩进4个空格
        const newText = text.substring(0, start).replace(/^(\s{4})/gm, '') + text.substring(start);
        editor.value = newText;
        // 移动光标回到原来的位置
        editor.setSelectionRange(start - 4 < 0 ? 0 : start - 4, end - 4 < 0 ? 0 : end - 4);
        return;
    }
    // 处理 Tab 键
    if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertText', false, '    '); // 插入四个空格作为缩进
    }
}

// 将文本内容按行分割并用 <div> 封装起来
function setEditorContent(content) {
    const lines = content.split('\n'); // 按行拆分
    editor.innerHTML = ''; // 清空编辑器内容
    lines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.textContent = line; // 将每行添加到 div 中
        editor.appendChild(lineDiv); // 添加到 editor
    });
}

// 添加鼠标悬浮高亮显示
function onMouseOnHighlight(event) {
    const lineElements = editor.childNodes; // 获取所有行元素
    const lineHeight = parseInt(getComputedStyle(editor).lineHeight);

    // 根据鼠标的 Y 坐标计算行索引
    const lineIndex = Math.floor((event.clientY - editor.getBoundingClientRect().top) / lineHeight) - 1;

    // 清除之前的高亮
    if (currentHighlight && currentHighlight.classList) {
        currentHighlight.classList.remove('highlight');
    }

    // 高亮当前行
    if (lineElements[lineIndex]) {
        currentHighlight = lineElements[lineIndex]; // 记录当前高亮行
        currentHighlight.classList && currentHighlight.classList.add('highlight');
    }
}

// 监听输入框内容的变化
function onInputText(event) {
    const text = Array.from(editor.childNodes).map(div => div.textContent).join('\n'); // 聚合行内容
    app.markdownText = text; // 更新 Vue 数据
    highlightCurrentLine(); // 高亮光标所在的行
    displayEditorOpenFileButton();
}

function displayEditorOpenFileButton() {
    if (editor.innerText.trim() === '') {
        EditerOpenFileButton.style.display = 'block'; // 编辑框为空时显示按钮
    } else {
        EditerOpenFileButton.style.display = 'none'; // 否则隐藏按钮
    }
}

// 高亮光标所在行
function highlightCurrentLine() {
    // 清除之前的高亮
    if (currentHighlight && currentHighlight.classList) {
        currentHighlight.classList.remove('highlight');
    }

    // 获取光标位置
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const lineElement = range.startContainer.parentNode; // 获取光标所在的行

    if (lineElement) {
        currentHighlight = lineElement; // 记录当前高亮行
        currentHighlight.classList && currentHighlight.classList.add('highlight'); // 添加高亮类
    }
}

// 处理粘贴事件
function handlerPasteText(event) {
    event.preventDefault(); // 防止默认的粘贴行为
    // 获取纯文本
    const text = event.clipboardData.getData('text/plain');
    // 插入纯文本
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents(); // 清除当前选中的内容
        const textNode = document.createTextNode(text); // 创建文本节点
        range.insertNode(textNode); // 插入纯文本节点
        range.collapse(false); // 将光标移动到文本后面
    }
};

// 允许在窗口加载时设置初始内容
setEditorContent(" ");
displayEditorOpenFileButton();

// ----------------------- 文件操作 ----------

// 打开文件的功能
async function openFile(){
    const filePaths = await window.file.openFile(); // 调用打开文件的 API
    if (filePaths.length > 0) {
        currentFilePath = filePaths[0];
        try {
            const fileContent = await window.file.readFile(currentFilePath); // 使用 API 读取文件内容
            editor.innerText = fileContent; // 将内容设置到编辑器中
            app.markdownText = fileContent; // 更新 Vue 数据
            displayEditorOpenFileButton();

        } catch (error) {
            console.error('Failed to read file:', error);
        }
    }
};

async function openFolder() {
    const folderPaths = await window.file.openFolder(); // 调用打开文件夹的 API
    if (folderPaths.length > 0) {
        console.log('Selected folder:', folderPaths[0]); // 处理选中的文件夹路径
        
        alert('打开文件夹功能暂未实现'); // 弹出提示信息
    }
};


// 监听文件打开的事件
window.api.receive('file-opened', async (filePath) => {
    console.log('接收到的文件路径:', filePath);
    await readFileContent(filePath); // 调用读取文件内容的函数
});

// 读取文件内容的逻辑
async function readFileContent(filePaths) {
    if (filePaths.length > 0) {
        currentFilePath = filePaths[0];
        try {
            const fileContent = await window.file.readFile(currentFilePath); // 使用 API 读取文件内容
            editor.innerText = fileContent; // 将内容设置到编辑器中
            app.markdownText = fileContent; // 更新 Vue 数据
            displayEditorOpenFileButton();

        } catch (error) {
            console.error('Failed to read file:', error);
        }
    }
}