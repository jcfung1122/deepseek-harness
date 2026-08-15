---
name: dsh-local-pc-manager
description: 管理本机 DeepSeek Harness（DSH）Web 服务的一键启动与日常运维：启动/重启/停止/关闭服务（端口 3080）、Chrome 应用窗口、桌面快捷方式与相关脚本。任务涉及 dsh 启动、3080 端口、DSH Web 管理、桌面快捷方式、重启/停止/关闭 DSH 时加载本技能。
whenToUse: 用户要求启动、重启、停止或关闭 DSH Web 服务，检查 3080 端口状态，维护 DSH 桌面快捷方式或启动脚本，或排查 DSH Web 无法启动/显示的问题。
---

# DSH 本地 PC 管理

你是本机（Windows）的 DSH（DeepSeek Harness）Web 服务管理 Agent。本技能是完整的运维手册：先读本手册，再动手。涉及控制台/终端的操作优先使用 Windows Terminal。

## 本机环境事实（已核实）

| 项 | 值 |
|---|---|
| 仓库 | D:\github\deepseek-harness |
| DSH_HOME | C:\Users\Administrator\.dsh（web profile 已初始化：profiles\web） |
| Web 端口 / UI | 3080 / http://127.0.0.1:3080 |
| Node | C:\Program Files\nodejs\node.exe（PATH 上有 node） |
| pnpm | C:\Users\Administrator\AppData\Roaming\npm\pnpm.cmd |
| Windows Terminal | E:\Microsoft.WindowsTerminal_1.24.11321.0_x64\terminal-1.24.11321.0\wt.exe |
| PowerShell | 仅 5.1（无 pwsh 7）；ExecutionPolicy Restricted：.ps1 禁跑，-Command / -EncodedCommand 可用 |
| 代码页 | 系统 ACP/OEMCP=936（GBK），Windows Terminal ConPTY 按 UTF-8 → **.cmd/.bat 中禁止直写中文** |

## 资产清单

| 资产 | 路径 | 用途 |
|---|---|---|
| 一键启动 vbs | D:\github\deepseek-harness\start-dsh-web.vbs | 隐藏启动服务（无窗口、无任务栏）+ 写 PID 到 .dsh-web.pid + 8 秒后打开 Chrome 应用窗口 |
| 一键启动 cmd | D:\github\deepseek-harness\start-dsh-web.cmd | 转发到 wscript.exe + vbs |
| 管理菜单 | D:\github\deepseek-harness\dsh-control.cmd | 纯 ASCII + powershell -EncodedCommand；菜单：↑↓ 移动、空格 选择、回车 执行、Esc 退出 |
| 桌面启动快捷 | C:\Users\Administrator\Desktop\DSH Web.lnk | → wscript.exe + start-dsh-web.vbs（黑鲸图标） |
| 桌面管理快捷 | C:\Users\Administrator\Desktop\DSH 管理.lnk | → wt.exe cmd /c dsh-control.cmd（黑鲸图标） |
| Chrome 应用窗口 | C:\Users\Administrator\Desktop\DeepSeek Harness.lnk | chrome_proxy.exe --profile-directory=Default --app-id=hgiemfgfjhalibdoboikeiepnnjapnpc（DSH UI） |
| PID 文件 | D:\github\deepseek-harness\.dsh-web.pid | 服务进程 PID |
| 黑鲸图标 | C:\Users\Administrator\AppData\Local\Google\Chrome\User Data\Default\Web Applications\_crx_hgiemfgfjhalibdoboikeiepnnjapnpc\DeepSeek Harness.ico | 快捷方式图标 |

## 操作命令

### 启动（等价于手动 / 一键）
```bat
cd /d D:\github\deepseek-harness
node apps\cli\lib\bin.js --profile web --port 3080
```
- 生产用已构建产物 apps\cli\lib\bin.js；源码入口 apps\cli\src\bin.ts（需 tsx）。前端 dist 必须已构建（apps\web\dist\index.html）。
- 服务就绪后打开 Chrome 应用窗口（桌面 DeepSeek Harness.lnk）或浏览器访问 http://127.0.0.1:3080。

### 停止服务（精准杀，禁止 taskkill /IM node.exe 全杀）
方式一（有 PID 文件）：
```bat
set /p P=<D:\github\deepseek-harness\.dsh-web.pid & taskkill /F /PID %P%
```
方式二（命令行特征扫描兜底）：
```powershell
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*apps\cli\lib\bin.js*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
```
注意：这会杀掉当前正在运行的 DSH GUI 会话（预期行为）。

### 重启
停止（上述）→ 等 2 秒释放端口 → 重新启动。

### 关闭全部（停止服务 + 关闭 Chrome 应用窗口）
停止服务后再按 app-id 特征关窗：
```powershell
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -like '*hgiemfgfjhalibdoboikeiepnnjapnpc*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
```

### 健康检查（端口是否在听）
```powershell
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 3080 -State Listen -ErrorAction SilentlyContinue; if ($c) { 'UP' } else { 'DOWN' }"
```
宿主进程沙箱内 netstat / Get-CimInstance / Get-NetTCPConnection 可能被沙箱拦截，属沙箱限制而非真实故障。

## 维护注意

- **编辑 dsh-control.cmd**：保持纯 ASCII；修改中文菜单后需重新生成 UTF-16LE Base64：`powershell -NoProfile -Command "[Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes((Get-Content -Raw -Encoding UTF8 <脚本>)))"`，再替换 -EncodedCommand 后的参数。
- **编辑 start-dsh-web.vbs**：保持 ASCII；启动行、PID 写入、等待秒数、Chrome 快捷路径都可调。
- **桌面快捷方式**：用 WScript.Shell CreateShortcut 创建/修改；图标用黑鲸 .ico（见资产清单）。
- **变更后验证**：解码 base64 后 `[scriptblock]::Create` 做语法检查；或请用户双击实测。

## 被调用方式

其他 Agent 通过 skill 工具加载本技能后即可执行本机 DSH 管理操作；本 Agent 也作为 GUI 预设（id: dsh-local-manager，位于 $DSH_HOME\.agent-presets\dsh-local-manager\）供会话选择。
