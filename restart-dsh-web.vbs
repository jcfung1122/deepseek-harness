' DSH web service restarter: stops the running server (by command-line
' signature, never a blanket node kill) and starts it again under the
' workspace DSH_HOME. Runs standalone under wscript so it survives the
' server process it kills.
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Stop the existing dsh server if any.
killCmd = "powershell -NoProfile -Command ""Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*apps\cli\lib\bin.js*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"""
shell.Run killCmd, 0, True

WScript.Sleep 3000

' Start the server pinned to the workspace DSH_HOME.
shell.CurrentDirectory = "D:\github\deepseek-harness"
shell.Environment("PROCESS")("DSH_HOME") = "D:\github\deepseek-harness\.dsh"
pid = shell.Run("""C:\Program Files\nodejs\node.exe"" apps\cli\lib\bin.js --profile web --port 3080", 0, False)
Set f = fso.CreateTextFile("D:\github\deepseek-harness\.dsh-web.pid", True)
f.Write pid
f.Close

WScript.Sleep 8000
shell.Run """C:\Users\Administrator\Desktop\DeepSeek Harness.lnk"""
