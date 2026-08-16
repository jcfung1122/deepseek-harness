# @deepseek-ai/dsh-client-ui-color-accents

[English](README.md) | 中文

Web 彩色点缀插件：给第三方 git 面板（`dsh-better-sidebar` 的源代码管理标签页、`@linxin666/dsh-client-ui-git-graph` 的分支 chip 与 graph 弹窗）里的 git 标签加上 VSCode 风格的语义分色，并给整个界面叠加一层品牌蓝 token 点缀。

浏览器侧做两件事。一个只读装饰器（子树 `MutationObserver`）按文本给 git 元素打上 `data-dsh-git-kind`：状态字母（`M`/`A`/`D`/`R`/`C`/`U`/`T`/`?`）与 ref 标签（`HEAD`/分支/`origin/` 远程/`tag: ` 标签）。配色表再通过 `--dsw-*` 调色板（状态 token 上的 `color-mix` 淡色）上色，因此暗/亮双主题自动适配。它用 git-graph 稳定的 `data-gitgraph-*` 属性与 better-sidebar 的 CSS Modules 类名后缀（`[class*="gitBadge"]`、`[class*="gitLogRef"]`、`[class*="gitBranchSelect"]`、`[class*="gitLogHash"]`）来命中元素，后缀不随哈希前缀变化。

品牌蓝层把 `--dsw-alias-brand-primary` 指向业务蓝，并把 `--dsw-alias-button-primary-fill` 钉回原来的中性色，于是焦点环、输入框边框、选中态获得品牌蓝，而主按钮在两种主题下都保持原有的反色文字对比。宿主侧刻意留空——所有副作用都属于浏览器展示层。

## Model Experience

无。插件只注入样式表与 token 层，并写入只读 `data-*` 属性；不贡献任何工具、提示词或模型可见数据。

#### KV Cache effect

无。

## Known Limitations and Deferred Work

- **依赖第三方插件的选择器** —— better-sidebar 靠哈希类名后缀、git-graph 靠 `data-*` 属性定位。若未来大版本重命名本地类名（`gitBadge`/`gitLogRef`/`gitBranchSelect`/`gitLogHash`）或移除 `data-gitgraph-*` 属性，需要同步更新本包选择器。
- **ref 分类基于文本** —— better-sidebar 渲染前已剥离 `tag: ` 与 `HEAD -> ` 前缀，因此它的标签与当前分支会归为 `branch`；git-graph 保留原始前缀，能得到更完整的 `tag`/`head` 区分。
- **品牌点缀刻意不完整** —— 主按钮填充保持单色，以免破坏反色文字对比；如需蓝色主按钮，请单独重做整套按钮配色。
