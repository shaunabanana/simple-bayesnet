const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

let pyProc = null

const PY_DIST_FOLDER = 'python-build'
const PY_FOLDER = 'python'
const PY_MODULE = 'api' // without .py suffix

const guessPackaged = () => {
    const fullPath = path.join(__dirname, PY_DIST_FOLDER)
    return require('fs').existsSync(fullPath)
}

const getScriptPath = () => {
    if (!guessPackaged()) {
        return path.join(__dirname, PY_FOLDER, PY_MODULE + '.py')
    }
    if (process.platform === 'win32') {
        return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE, PY_MODULE + '.exe')
    }
    return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE, PY_MODULE)
}

const createPyProc = () => {
    let script = getScriptPath()
    let port = '4242'
    
    if (guessPackaged()) {
        pyProc = require('child_process').execFile(script, [port])
    } else {
        pyProc = require('child_process').spawn('python3', [script, port])
    }
    
    if (pyProc != null) {
        //console.log(pyProc)
        console.log('child process success on port ' + port)
    }
}


const exitPyProc = () => {
    pyProc.kill()
    pyProc = null
    pyPort = null
}

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    })
    
    // and load the index.html of the app.
    win.loadURL(require('url').format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    
    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.on('ready', createPyProc)
app.on('will-quit', exitPyProc)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.