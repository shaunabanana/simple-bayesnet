# Probabilistic User Modeling

## Development

1. Setup Electron 1.7.6 with zeromq to communicate with Python as described [here](https://github.com/fyears/electron-python-example).

2. Install pgmpy, pandas and xlrd using pip.

## Packaging

Change PyInstaller code in `/Library/Frameworks/Python.framework/Versions/3.6/lib/python3.6/site-packages/PyInstaller/hooks/hook-_tkinter.py` line 183 to:

```python
if 'Library/Frameworks' in path_to_tcl and 'Python' not in path_to_tcl:
```

Comment out the dumb version checking code in `./node_modules/electron-packager/cli.js`:

```javascript
/*
if (nodeVersionInfo < [4, 0, 0]) {
  console.error('CANNOT RUN WITH NODE ' + process.versions.node)
  console.error('Electron Packager requires Node 4.0 or above.')
  process.exit(1)
}
*/
```

