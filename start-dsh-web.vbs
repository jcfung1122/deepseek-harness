' One-click DSH web launcher.
' Starts the dsh server hidden (no console window, no taskbar button),
' records its PID for the management menu, waits for it to boot,
' then opens the DSH Chrome app window.
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
shell.CurrentDirectory = "D:\github\deepseek-harness"
' Pin DSH_HOME to the workspace so the server never falls back to ~/.dsh.
shell.Environment("PROCESS")("DSH_HOME") = "D:\github\deepseek-harness\.dsh"
pid = shell.Run("""C:\Program Files\nodejs\node.exe"" apps\cli\lib\bin.js --profile web --port 3080", 0, False)
Set f = fso.CreateTextFile("D:\github\deepseek-harness\.dsh-web.pid", True)
f.Write pid
f.Close
WScript.Sleep 8000
' Open the DSH Chrome app window only if it is not already running, so a
' re-launch never stacks a duplicate window.
checkCmd = "powershell -NoProfile -Command ""$p = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -like 'chrome*' -and $_.CommandLine -like '*hgiemfgfjhalibdoboikeiepnnjapnpc*' }; if ($p) { exit 0 } else { exit 1 }"""
rc = shell.Run(checkCmd, 0, True)
If rc <> 0 Then
  shell.Run """C:\Users\Administrator\Desktop\DeepSeek Harness.lnk"""
End If
