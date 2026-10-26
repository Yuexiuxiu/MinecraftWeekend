# 周末愉快 · Minecraftweekend

一个 Minecraft 生存服务器信息页，通过 **GitHub Pages** 发布。

- 线上地址：<https://mc.minecraftweekend.cn/>
- GitHub 仓库：<https://github.com/Yuexiuxiu/MinecraftWeekend>
- 技术栈：纯 HTML + CSS + JavaScript，无框架、无后端、无数据库
- 当前服务器：**周末愉快 / Minecraftweekend**，版本 **26.50**，生存模式，只有一个服务器
- QQ 群：`870774459`；QQ 频道：`cdcvk4521a`；邮箱：`lingyueyue148@163.com`

> 页面不公开服务器 IP，统一提示“进群获取地址”。如需公开地址，请同时修改首页服务器卡片和 FAQ。

---

## 1. 文件结构

```text
D:\Website\
├─ index.html                    # 首页
├─ changelog.html                # 网站更新日志 / 版本时间线
├─ server-changelog.html         # 游戏服务器更新日志 / 版本时间线
├─ about.html                    # 关于
├─ privacy.html                  # 隐私政策
├─ 404.html                      # 自定义 404
├─ changelog.json                # 网站日志数据源（日常只需改这里）
├─ server-changelog.json         # 游戏服务器日志数据源
├─ changelog.xml                 # 网站日志 RSS 2.0
├─ server-changelog.xml          # 游戏服务器日志 RSS 2.0
├─ assets/
│  ├─ css/
│  │  └─ style.css               # 全站样式 / 响应式 / changelog / QR 弹层
│  ├─ js/
│  │  ├─ main.js                 # 导航、二维码、滚动高亮、复制、全局 QR 弹层
│  │  └─ changelog.js            # 两份 JSON、时间线、筛选、未读、状态兜底
│  └─ img/
│     ├─ favicon.svg
│     ├─ og-cover.png
│     ├─ qq-group-qr.png
│     └─ qq-channel-qr.png
├─ robots.txt
├─ sitemap.xml
├─ CNAME                         # mc.minecraftweekend.cn
├─ .nojekyll
└─ README.md
```

---

## 2. 本地预览

```powershell
cd D:\Website
python -m http.server 8080 --bind 127.0.0.1
```

打开 <http://127.0.0.1:8080/>。不要直接双击 HTML，因为 changelog 使用 `fetch` 读取同目录 JSON，需要通过 HTTP 访问。

---

## 3. 更新日志系统（网站 / 游戏服务器）

### 3.1 两份日志

```text
changelog.json
      │  fetch（同源静态文件，无后端）
      ├──> changelog.html：网站更新日志
      └──> index.html：首页公告板，取最新 1 条

server-changelog.json
      │  fetch
      ├──> server-changelog.html：游戏服务器更新日志
      └──> index.html：首页公告板，取最新 1 条
```

- 两个页面顶部都有 **网站更新 / 游戏服务器更新** 切换标签。
- 网站日志记录界面、功能、SEO、修复等站点变更。
- 服务器日志记录游戏版本、玩法、规则、性能与修复。
- 首页公告板各取最新 1 条，共 2 条摘要，并标注“网站 / 游戏服务器”。
- 两份日志共用 `assets/js/changelog.js`，通过 `data-changelog-source` 与 `data-changelog-kind` 配置。
- 不用数据库，不用构建工具，不需要改 HTML。
- 支持标签筛选：**新增 / 调整 / 修复 / 重要**。
- 重要版本有独立的高亮边框、节点和日期标签。
- 详情默认折叠，点击条目下的“展开变更明细”查看。
- 未读状态按日志分别保存在浏览器 `localStorage`，不会发送到服务器。
- 网络失败时有“重新加载 / 前往 QQ 群”的兜底；筛选无结果时有空状态。

### 3.2 数据结构

两个 JSON 使用相同结构。`changelog.json` 的顶层结构：

```json
{
  "site": {
    "name": "周末愉快",
    "englishName": "Minecraftweekend",
    "serverVersion": "26.50",
    "latestVersion": "v1.3.0",
    "updatedAt": "2026-10-26",
    "description": "周末愉快网站版本变更记录。"
  },
  "entries": []
}
```

`server-changelog.json` 的 `site.latestVersion` 使用服务器版本，例如 `26.50`，`serverVersion` 同样为 `26.50`。

单条版本：

```json
{
  "id": "v1-3-0",
  "version": "v1.3.0",
  "date": "2026-10-26",
  "title": "更新日志拆成两份，页面也重新排了",
  "summary": "一句话摘要，会显示在首页公告板和日志页。",
  "important": true,
  "tags": ["新增", "重要"],
  "changes": [
    { "type": "新增", "text": "具体变更内容。" },
    { "type": "调整", "text": "具体变更内容。" },
    { "type": "修复", "text": "具体变更内容。" },
    { "type": "重要", "text": "重要说明。" }
  ]
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一锚点，建议使用 `v1-2-0` 形式，用于页面 `#v1-2-0` |
| `version` | 显示的版本徽章；网站用 `v1.3.0`，服务器用 `26.50` |
| `date` | `YYYY-MM-DD`，排序依据 |
| `title` | 本次版本标题 |
| `summary` | 摘要，首页会各取最新一条 |
| `important` | 是否为重点版本 |
| `tags` | 只能是 `新增`、`调整`、`修复`、`重要` |
| `changes` | 折叠详情中的变更条目 |

> 网站版本与游戏服务器版本是两个概念：网站日志使用 `v1.x.x`；服务器日志使用游戏版本号，例如 `26.50`。

### 3.3 新增一个版本（不用改 HTML）

**网站更新：**

1. 打开 `changelog.json`。
2. 在 `entries` 数组最前面复制一个对象并按实际情况修改。
3. 更新 `site.latestVersion` 和 `site.updatedAt`。
4. 保存并推送，`changelog.html` 和首页会自动读取。

**游戏服务器更新：**

1. 打开 `server-changelog.json`。
2. 在 `entries` 数组最前面添加服务器版本记录。
3. 更新 `site.latestVersion`、`site.serverVersion` 和 `site.updatedAt`。
4. 保存并推送，`server-changelog.html` 和首页会自动读取。

日期即使不按顺序填写也没关系，前端会按 `date` 倒序排序。`id` 在两份日志内部各自唯一即可；跨日志重复不会冲突，但建议加 `server-` 前缀便于区分。

> `server-changelog.json` 目前只放了 26.50 的初始版本说明，没有虚构历史开服记录。后续请按真实服务器更新继续追加。

### 3.4 未读标记

- 网站日志存储键：`weekend-changelog-read-website-v1`
- 服务器日志存储键：`weekend-changelog-read-server-v1`
- 内容：各自已读版本的 `id` 数组
- 只存在当前浏览器的 `localStorage`，两份日志互不影响
- 游客首次访问时，当前所有版本显示为“未读”
- 点击“全部标为已读”或展开某个版本详情后，状态会更新
- 清除浏览器站点数据即可重置

隐私政策已对应说明这两个键。

### 3.5 RSS

- 网站日志：<https://mc.minecraftweekend.cn/changelog.xml>
- 游戏服务器日志：<https://mc.minecraftweekend.cn/server-changelog.xml>
- 两个页面头部均已加入对应的 RSS 自动发现链接，页面内也有 RSS 入口。
- `changelog.xml` / `server-changelog.xml` 都是**静态 RSS 镜像**。新增日志时，站内页面只需要改 JSON；如果希望 RSS 读者也收到新条目，请同步更新对应 XML（或后续再加 GitHub Action 自动生成）。

### 3.6 加载失败 / 空状态

- 请求失败：显示“更新日志暂时加载失败”，提供重新加载按钮和 QQ 群入口。
- 数据为空：显示空状态，不显示错误堆栈。
- 筛选无结果（例如服务器日志暂无“修复”条目）：显示“暂时没有服务器更新”的空状态。
- 没有 JavaScript：显示 `<noscript>` 提示，直接指向对应 JSON。

---

## 4. 首屏与性能

当前实现尽量保持轻量：

- 不请求外部字体、CSS、JS、图片或 CDN。
- 字体使用 `system-ui` 系统字体栈。
- 二维码图片全部 `loading="lazy"`；首屏不加载二维码。
- 更新日志通过 fetch 异步读取，不阻塞首屏 HTML/CSS。
- 主样式和主脚本使用 `?v=20261026-2` 版本参数，避免旧缓存。
- 页面体积不大，GitHub Pages 会进行传输压缩。

> “首屏 1.5 秒”取决于访问者网络、DNS、GitHub Pages 跨境链路和设备性能，静态站只能尽量减少阻塞资源，不能承诺所有网络环境都低于 1.5 秒。

---

## 5. 二维码入口

1. 顶部导航“加入社区”：桌面悬停、点击或手机点按显示 QQ 群与 QQ 频道二维码。
2. 加入社区区域“查看 / 收起二维码”：悬停或点击展开，带显式关闭按钮。
3. 右下角常驻“扫码加入”提示：点击打开居中二维码弹层，带遮罩、关闭按钮和焦点管理。
4. 弹层支持：点击关闭按钮、点击遮罩、按 Esc 关闭；关闭后焦返回触发按钮。

所有二维码图片均为本地静态资源，并保留扫码留白。

---

## 6. 部署到 GitHub Pages

```powershell
cd <你的仓库目录>
git add .
git commit -m "更新站点与更新日志"
git push origin main
```

GitHub 仓库：

1. **Settings → Pages**
2. Source：**Deploy from a branch**
3. Branch：`main`，目录 `/ (root)`
4. Custom domain：`mc.minecraftweekend.cn`
5. 域名检查通过后启用 **Enforce HTTPS**

仓库根目录 `CNAME` 内容应保持：

```text
mc.minecraftweekend.cn
```

更新完文件后使用 `Ctrl + F5` 强制刷新，避免浏览器继续使用旧版 CSS/JS。

### 6.1 两个日志页一直显示“正在读取”

先确认以下三个文件已经上传到仓库对应路径，并能在线上直接打开：

- `assets/css/style.css`
- `assets/js/main.js`
- `assets/js/changelog.js`

只上传 HTML、JSON 和 CSS，而漏掉 `assets/js/changelog.js`，页面会一直停在加载状态。上线后可以检查：

```text
https://mc.minecraftweekend.cn/assets/js/changelog.js?v=20261026-2
```

应返回 JavaScript 源码，而不是 404 页面。当前资源版本已统一为 `?v=20261026-2`；浏览器仍显示旧样式时，用 `Ctrl + F5` 强制刷新。

---

## 7. 修改时需要同步的位置

### 7.1 修改 CSS / JS 后

递增所有 HTML 中的资源版本号：

```text
assets/css/style.css?v=20261026-2
assets/js/main.js?v=20261026-2
assets/js/changelog.js?v=20261026-2
```

例如改为 `?v=20261027-1`。只更新 JSON 内容时不需要改版本号。

### 7.2 修改域名后

同步更新：

- 所有页面的 canonical、`og:url`
- JSON-LD 内的 URL
- `robots.txt` 的 Sitemap 地址
- `sitemap.xml`
- `changelog.xml` / `server-changelog.xml` 的站点链接和 item link
- `CNAME`（GitHub Pages）
- README

### 7.3 修改服务器版本 26.50 时

搜索并同步：

- `index.html`
- `about.html`
- `server-changelog.html`（`data-latest-version` 回退值）
- `server-changelog.json`（新增一条服务器版本记录）
- `server-changelog.xml`（可选，同步服务器 RSS）
- `README.md`
- 首页 FAQ 与服务器卡片中的 26.50

### 7.4 修改 QQ / 邮箱

涉及：

- `index.html` 的加入区、二维码面板、FAQ、页脚
- `about.html`、`privacy.html`、`404.html`、`changelog.html`、`server-changelog.html` 的页脚
- 复制按钮的 `data-copy`
- 二维码图片 `assets/img/qq-group-qr.png`、`assets/img/qq-channel-qr.png`
- 全局二维码弹层中的文本与图片在 `assets/js/main.js`

---

## 8. SEO 与站点地图

- 网站更新日志：`https://mc.minecraftweekend.cn/changelog.html`
- 游戏服务器更新日志：`https://mc.minecraftweekend.cn/server-changelog.html`
- XML Sitemap：`https://mc.minecraftweekend.cn/sitemap.xml`
- 网站 RSS：`https://mc.minecraftweekend.cn/changelog.xml`
- 服务器 RSS：`https://mc.minecraftweekend.cn/server-changelog.xml`
- 页面包含 title、description、canonical、Open Graph、Twitter Card、JSON-LD
- 两个日志页各自输出 `CollectionPage`、`BreadcrumbList`，以及根据 JSON 生成的 `ItemList`
- 页脚和 `404.html` 均有网站日志、服务器日志、RSS、站点地图入口

---

## 9. 上线检查

- [ ] 首页最近更新显示 2 条（网站 1 条 + 服务器 1 条），按时间倒序
- [ ] 顶部版本入口可进入网站更新日志
- [ ] `changelog.html` 加载 5 条网站记录
- [ ] `server-changelog.html` 加载服务器版本 26.50 记录
- [ ] 两个日志页顶部“网站更新 / 游戏服务器更新”切换正常
- [ ] “重要”筛选只显示重要版本
- [ ] 展开详情后显示变更条目
- [ ] “全部标为已读”有效，刷新后各自未读状态保留
- [ ] 断开/删除 JSON 时显示加载失败，而不是空白
- [ ] 空数组或筛选无结果时显示空状态
- [ ] QQ 群/频道二维码只在操作后显示，默认不铺开
- [ ] 桌面悬停、手机点按顶部“加入社区”都可以打开二维码
- [ ] 全局二维码弹层关闭按钮可用，Esc 可关闭
- [ ] 390px 移动端无横向滚动
- [ ] 移动端正文行高为 1.8
- [ ] `sitemap.xml` 已包含两个日志页
- [ ] RSS `changelog.xml`、`server-changelog.xml` 均可被解析
- [ ] GitHub Pages 部署成功，HTTPS 正常

---

## 10. 合规与隐私

- 更新日志的已读状态只保存在浏览器 `localStorage`，不发送到服务器；详见 `privacy.html`。
- 网站使用 GitHub Pages 托管，访问时托管平台可能处理基础日志。
- 游戏服务器是否要求备案、运营许可或其他手续，应按实际服务商与适用规则自行核对。
- 不要使用绕过备案、隐藏源站规避监管或灰色接入方案。
- 本站非 Mojang 官方站点，Minecraft 名称及相关商标归其权利人所有。
