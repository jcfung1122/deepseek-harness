# web profile 插件配置快照

本目录保存 DSH **web 配置**（`--profile web`）的插件清单快照，用于版本控制与回滚。

实际生效位置在 `%DSH_HOME%\profiles\web\`（本机为 `C:\Users\Administrator\.dsh\profiles\web\`），不在本仓库内。这里是一份**存档副本**，记录了「当前装了哪些插件、什么版本」。

## 包含文件

- `package.json` —— 插件依赖列表 + `dsh.profile.bundles` 层顺序（核心）
- `pnpm-lock.yaml` —— 精确锁定的版本
- `pnpm-workspace.yaml` —— profile 的 pnpm 配置
- `cordis.yml` / `cordis.patch.yml` —— 组合层（用户 patch 层目前为空）

## 日常维护三步走（记住这个就够）

**① 改了插件（增/删/升级）后，刷新快照并推送：**

在 GUI 里用 `dsh plugin --profile web add/remove ...` 改完插件后，回到本仓库根目录执行：

```powershell
Copy-Item C:\Users\Administrator\.dsh\profiles\web\package.json        local-ops\web-profile\
Copy-Item C:\Users\Administrator\.dsh\profiles\web\pnpm-lock.yaml      local-ops\web-profile\
Copy-Item C:\Users\Administrator\.dsh\profiles\web\pnpm-workspace.yaml local-ops\web-profile\
Copy-Item C:\Users\Administrator\.dsh\profiles\web\cordis.yml          local-ops\web-profile\
Copy-Item C:\Users\Administrator\.dsh\profiles\web\cordis.patch.yml    local-ops\web-profile\
git add local-ops/web-profile
git commit -m "ops(dsh): 更新插件配置快照"
git push origin master
```

**② 回滚插件到某个旧状态：**

```powershell
# 找到想回到的版本（记下那个提交的短哈希）
git log --oneline -- local-ops/web-profile/package.json

# 取出那个旧版 package.json，覆盖回生效目录
git show <提交哈希>:local-ops/web-profile/package.json > C:\Users\Administrator\.dsh\profiles\web\package.json

# 在生效目录重装，恢复当时的插件集合
cd C:\Users\Administrator\.dsh\profiles\web
pnpm install
# 然后重启 DSH Web 服务
```

**③ 同步官方 DSH 更新（与插件无关，但属于同一套维护）：**

```powershell
git fetch upstream
git merge upstream/master
pnpm run build
# 重启 Web GUI：node apps\cli\lib\bin.js --profile web --port 3080
```

> 若 merge 报「找不到共同祖先」，本仓库是浅克隆，先 `git fetch upstream --deepen=500` 补历史再 merge。

## 安全红线（每次 push 前看一眼）

- `.env` 里有 `GITHUB_TOKEN`，已被 `.gitignore` 排除，**绝不提交**。
- push 前确认暂存区只有 `local-ops/web-profile/` 这 6 个文件、无 `.env`/日志/`*.tsbuildinfo`。
- 详细推送认证方式见仓库根目录 `SYNC.md`（token 不落盘，用临时 Basic 头注入）。
