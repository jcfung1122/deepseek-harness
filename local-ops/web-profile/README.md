# web profile 插件配置快照

本目录保存 DSH **web 配置**（`--profile web`）的插件清单快照，用于版本控制与回滚。

实际生效位置在 `%DSH_HOME%\profiles\web\`（本机为 `C:\Users\Administrator\.dsh\profiles\web\`），不在本仓库内。这里是一份**存档副本**，记录了「当前装了哪些插件、什么版本」。

## 包含文件

- `package.json` —— 插件依赖列表 + `dsh.profile.bundles` 层顺序（核心）
- `pnpm-lock.yaml` —— 精确锁定的版本
- `pnpm-workspace.yaml` —— profile 的 pnpm 配置
- `cordis.yml` / `cordis.patch.yml` —— 组合层（用户 patch 层目前为空）

## 如何更新快照

每次在 GUI 里增删插件（`dsh plugin --profile web add/remove ...`）后，把生效目录里的这 5 个文件重新复制到这里，再 commit + push 即可：

```powershell
Copy-Item C:\Users\Administrator\.dsh\profiles\web\package.json        local-ops\web-profile\
Copy-Item C:\Users\Administrator\.dsh\profiles\web\pnpm-lock.yaml      local-ops\web-profile\
Copy-Item C:\Users\Administrator\.dsh\profiles\web\pnpm-workspace.yaml local-ops\web-profile\
Copy-Item C:\Users\Administrator\.dsh\profiles\web\cordis.yml          local-ops\web-profile\
Copy-Item C:\Users\Administrator\.dsh\profiles\web\cordis.patch.yml    local-ops\web-profile\
```

## 回滚

用 git 历史找回某个旧版 `package.json`，覆盖回 `%DSH_HOME%\profiles\web\package.json`，然后在该目录下运行 `pnpm install` 即可恢复当时的插件集合。
