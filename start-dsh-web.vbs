' One-click DSH web launcher.
' Starts the dsh server hidden (no console window, no taskbar button),
' records its PID for the management menu, waits for it to boot,
' then opens the DSH Chrome app window.
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
shell.CurrentDirectory = "D:\github\deepseek-harness"
pid = shell.Run("""C:\Program Files\nodejs\node.exe"" apps\cli\lib\bin.js --profile web --port 3080", 0, False)
Set f = fso.CreateTextFile("D:\github\deepseek-harness\.dsh-web.pid", True)
f.Write pid
f.Close
WScript.Sleep 8000
shell.Run """C:\Users\Administrator\Desktop\DeepSeek Harness.lnk"""
