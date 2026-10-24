# 方块周末 · Minecraft 社区静态站

一个可以直接上传或通过 Git 部署的纯静态 Minecraft 社区 / 服务器导航落地页。

- 技术栈：HTML + CSS + JavaScript，无框架、无构建工具、无后端、无数据库、无登录、无支付。
- 视觉：深色 Minecraft 像素方块风，草方块绿点缀；所有装饰图形均由 CSS 绘制，不使用 Mojang 官方素材。
- 首选托管：**Cloudflare Pages**
- 海外备选：**腾讯云 EdgeOne Pages · 全球可用区（不含中国大陆）**
- 代码仓库 / 备用部署：**GitHub Pages**

> 当前页面中的服务器名称、地址、QQ 群、Discord 和邮箱均是占位内容。**正式上线前必须替换**，详见下方「上线前替换清单」。

---

## 1. 目标域名与 DNS 前提

| 项目 | 值 |
| --- | --- |
| 主域名 | `minecraftweeend.cn` |
| 本站使用 | 子域名 `mc.minecraftweeend.cn` |
| DNS 权限 | 你已在现有 DNS 服务商拥有解析权限 |
| 是否需要迁移 NS | **不需要** |
| 是否需要把主域名整体托管到 Cloudflare | **不需要** |
| 推荐记录 | `CNAME`，主机记录 `mc`，指向平台分配的域名 |

本项目按「仅给子域名添加 CNAME」设计：

```text
记录类型：CNAME
主机记录：mc
记录值：<托管平台分配的目标域名>   例如 your-project.pages.dev
TTL：600 秒（或服务商的 Auto / 自动）
代理状态：DNS only / 不代理
```

注意：

- 外站 DNS 面板里没有 Cloudflare 的「小黄云」代理开关是正常现象。因为 DNS 不在 Cloudflare，无法在 Cloudflare 侧开启代理；这条记录本身就是普通 DNS 记录。
- 如果未来换成 Cloudflare Pages，也**不需要**把 NS 迁到 Cloudflare，只要是**子域名**并添加 CNAME 即可。只有把**根域名/裸域**绑定到 Cloudflare Pages 时才涉及 Cloudflare Zone 与 NS。
- 子域名上不要同时保留同名的 A、AAAA、MX、TXT 等记录。DNS 的 CNAME 不能和同主机名的其他记录共存。
- 先删除旧的同名记录，再添加 CNAME；等待 TTL 到期和递归 DNS 缓存刷新。

---

## 2. 文件结构

```text
D:\Website\
├─ index.html                    # 首页：Hero、服务器、公告、加入、FAQ、页脚
├─ about.html                    # 关于：社区介绍、价值观、规则、参与方式
├─ privacy.html                  # 隐私政策：托管日志、Cookie、第三方链接等
├─ 404.html                      # 自定义 404 页（根目录版，使用根路径资源）
├─ assets/
│  ├─ css/
│  │  └─ style.css               # 全站样式、CSS 变量、响应式与动效
│  ├─ js/
│  │  └─ main.js                 # 移动端菜单、年份、复制、滚动出现
│  └─ img/
│     ├─ favicon.svg             # 手绘 SVG 草方块图标
│     └─ og-cover.png            # 1200×630 社交分享封面
├─ robots.txt                    # 抓取规则与 Sitemap 地址
├─ sitemap.xml                   # 3 个可索引页面的 Sitemap
├─ CNAME                         # 仅 GitHub Pages 自动读取；内容为 mc.minecraftweeend.cn
├─ .nojekyll                     # 让 GitHub Pages 跳过 Jekyll 处理
└─ README.md                     # 本文件
```

### 各文件职责

- `index.html`：主落地页，含 SEO、Open Graph、Twitter Card、JSON-LD。
- `about.html`：社区介绍、社区规则、素材与商标说明。
- `privacy.html`：静态站的隐私说明，包含 Cloudflare / EdgeOne / GitHub Pages 的日志提示。
- `404.html`：自定义错误页；因为 404 可能由任意深度的 URL 触发，所以页面中的 CSS、JS、链接使用 `/` 根路径。
- `style.css`：颜色变量、布局、响应式、CSS 方块世界插画、`prefers-reduced-motion` 支持。
- `main.js`：原生 JavaScript，无第三方依赖，不写 Cookie、不写本地存储。
- `CNAME`：GitHub Pages 会把它当作自定义域名；Cloudflare Pages / EdgeOne Pages 只会把它当作一个普通静态文件，不影响绑定自定义域名。

---

## 3. 本地预览

不要直接双击 HTML 文件（`file://` 下部分链接和根路径行为不一致），建议开一个本地静态服务器：

```powershell
cd D:\Website
python -m http.server 8080 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:8080/
```

如果有 Node.js，也可以使用：

```bash
npx serve .
```

本项目不需要 `npm install`，没有构建产物目录。

---

## 4. 上线前替换清单

建议先在 PowerShell 中搜索所有占位内容：

```powershell
Select-String -Path *.html,assets\js\main.js,README.md -Pattern '占位|example.com|123456789|方块周末|replace-me'
```

### 4.1 站点品牌与文案

搜索并替换：

- `方块周末`（站点名称，出现在所有页面、页脚、JSON-LD）
- `BLOCK WEEKEND`（英文副标题）
- 首页 Hero 的标题、简介、按钮文案
- `about.html` 中的社区故事与规则
- 页脚版权信息与「非 Mojang 官方站点」声明

替换站点名称时，同时更新这些 SEO 字段：

| 位置 | 需要检查的内容 |
| --- | --- |
| `index.html` / `about.html` / `privacy.html` | `<title>`, `description`, `keywords`, `og:title`, `og:description`, `og:site_name` |
| 三个页面的 `<head>` | `<link rel="canonical">`, `og:url` |
| `<script type="application/ld+json">` | `WebSite.name`, `Organization.name`, FAQ 文案 |
| `robots.txt` | `Sitemap:` 地址 |
| `sitemap.xml` | 3 个 `<loc>` 与更新日期 |
| `CNAME` | 自定义域名（仅 GitHub Pages 需要） |

### 4.2 服务器卡片（首页）

当前有三张占位卡片：`服务器名称 A/B/C`。

需要同步修改：

1. 卡片标题、玩法描述、版本、状态；
2. 可见的服务器地址；
3. 「复制」按钮上的 `data-copy` 值；
4. `data-copy-name` 可以保持为「服务器地址」。

每张卡片的结构示例：

```html
<h3>服务器名称 A</h3>
<p class="server-desc">一句话介绍服务器玩法、版本与加入门槛。</p>
...
<code>play.example.com</code>
<button
  class="copy-btn"
  type="button"
  data-copy="play.example.com"
  data-copy-name="服务器地址">
  复制
</button>
```

> 可见文本和 `data-copy` 必须一起改，否则会复制旧地址。

### 4.3 社区联系方式

占位值分布在：

- `index.html` 的「加入社区」区域与页脚；
- `about.html` 的「联系方式」段落与页脚；
- `privacy.html` 的「联系我们」段落与页脚。

当前占位值：

```text
QQ 群号：123456789
Discord：discord.gg/replace-me
邮箱：your-email@example.com
```

对应复制按钮的 `data-copy` 也要一并改。如果希望联系方式可以直接点击，可在替换后把 `<strong>` 包进 `<a href="...">`；QQ 群和 Discord 的外部链接建议加上：

```html
target="_blank" rel="noopener noreferrer"
```

### 4.4 公告与日期

- 把 `index.html` 公告区的 `置顶 · 示例公告`、`2026.10.24` 和正文换成真实内容。
- 修改 `privacy.html` 顶部的「最后更新」日期和 JSON-LD 的 `dateModified`。
- 每次更新页面后，同步修改 `sitemap.xml` 的 `<lastmod>`。
- 首页 Hero 下方的「当前为内容占位版本……」提示是提醒用的，正式上线前请删除对应的 `.hero-footnote` 段落或替换为真实提示。

### 4.5 图片与社交分享

- 站点图标：`assets/img/favicon.svg`，在三个页面的 `<link rel="icon">` 中引用。
- 社交分享图：`assets/img/og-cover.png`，尺寸 `1200×630`，在 `og:image` / `twitter:image` 中引用。
- 如果要替换分享图，保持文件路径不变即可；也可以换文件名，但必须同时改 3 个页面的 meta。
- 社交平台会缓存分享图，更换后可在对应平台的调试工具中重新抓取。
- 项目不依赖任何外部图片、字体或 CDN。

### 4.6 隐私政策

`privacy.html` 已按「没有登录、没有表单、没有支付、没有数据库；托管平台可能处理基础访问日志」来写。

正式上线前请逐项核对：

- 实际使用的是哪个托管平台；
- 是否真的没有启用任何第三方统计、广告、字体或客服脚本；
- 托管商实际的日志与 Cookie 行为；
- 联系邮箱是否真实可用；
- 如未来加入统计、表单、评论或支付，必须同步修改隐私政策。

---

## 5. 首选：Cloudflare Pages 部署

### 5.1 方案 A：直接上传（最快）

1. 登录 Cloudflare Dashboard。
2. 进入 **Workers & Pages** → **Create application** → **Pages** → **Upload assets / 直接上传**。
3. 输入项目名，例如 `minecraft-weekend`。
4. 把 **本项目根目录的内容** 拖入上传区，确保 `index.html` 位于最外层，而不是被多套一层 `Website` 文件夹。
5. 点击 **Deploy site / 部署**。
6. 部署完成后，你会得到类似 `https://minecraft-weekend.pages.dev` 的地址。

注意：

- 直接上传项目以后不能直接切换成 Git 集成；如果以后想通过 GitHub 自动部署，需要**新建一个 Git 集成项目**。
- 拖拽上传时不必上传 `.git`、本地预览文件夹或截图目录。
- `CNAME`、`.nojekyll` 和 `README.md` 上传后也只是普通文件，不影响 Cloudflare Pages 的自定义域名。
- Cloudflare 的拖拽上传有文件数量与单文件大小限制，本项目远低于限制。

### 5.2 方案 B：连接 Git 仓库（推荐长期维护）

先把代码推送到 GitHub：

```powershell
cd D:\Website
git init
git add .
git commit -m "Initial commit: Minecraft community static site"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

然后在 Cloudflare：

1. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**。
2. 选择刚才的 GitHub 仓库。
3. 配置：

| 配置项 | 建议值 |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `exit 0` |
| Build output directory | `/`（仓库根目录） |

如果界面不接受 `/`，改为 `.`，或者把网页文件放进一个 `public/` 目录，再把输出目录填为 `public`。核心要求是：**构建完成后的输出目录根层必须存在 `index.html`**。

4. 保存并部署。以后推送到 `main` 会自动重新部署。

Cloudflare Pages 官方对无构建静态站的建议也是：没有构建步骤时，构建命令可用 `exit 0`，输出目录指向实际内容所在目录。

### 5.3 绑定自定义域名 `mc.minecraftweeend.cn`

绑定顺序很重要：

1. 打开 Cloudflare Pages 项目 → **Custom domains**。
2. 点击 **Set up a domain**。
3. 输入 `mc.minecraftweeend.cn`，确认。
4. 因为你的 DNS 不在 Cloudflare，Cloudflare 会要求你在现有 DNS 服务商添加 CNAME。**先完成域名关联，再到外部 DNS 添加记录**。不要反过来只手动加一条 CNAME：Pages 还没有关联这个主机名时，可能出现 522 等错误。
5. 到你的 DNS 服务商添加：

| 字段 | 填写内容 |
| --- | --- |
| 记录类型 | `CNAME` |
| 主机记录 / 主机名 | `mc` |
| 记录值 / 目标 | `<你的项目名>.pages.dev`，以 Cloudflare 控制台显示值为准 |
| TTL | `600` 秒；也可用服务商自动值（通常 300–3600 秒） |
| 代理状态 | 没有 Cloudflare 代理选项；保持 **DNS only / 不代理** |

示例（请替换成真实项目名）：

```text
类型：CNAME
主机：mc
值：minecraft-weekend.pages.dev
TTL：600
```

说明：

- **不要**在记录值里填 `https://`、路径或 `mc.minecraftweeend.cn` 本身。
- 记录值末尾不要再手写一个点；如果服务商自动补上结尾点，那是正常的 FQDN 表示。
- 同一个主机名 `mc` 不要同时存在 A、AAAA、MX、TXT 等记录。
- 如果 DNS 服务商有「代理 / CDN / 加速」开关，先关闭，让它保持纯 CNAME。
- 你不需要迁移 NS，也不需要把 `minecraftweeend.cn` 的 NS 改为 Cloudflare。主域名的其他记录不受 `mc` 子域名影响。
- 如果你还在主域名上配置了限制性 CAA 记录，请确认允许 Cloudflare Pages 使用的证书颁发机构；否则可能阻碍证书签发。没有 CAA 记录时通常不需要额外添加。

### 5.4 HTTPS 证书什么时候生效？

- 域名关联后，Cloudflare Pages 会自动申请并部署 TLS 证书。
- 状态从 **Initializing / Pending** 变为 **Active** 后，进入 `https://mc.minecraftweeend.cn/` 应能看到证书。
- 一般情况：DNS 生效后几分钟到几十分钟；受 DNS TTL、递归缓存和证书签发排队影响，偶尔会更久。
- 不建议在状态还是 Pending 时反复删除/重加域名；先检查 CNAME 是否完全一致、是否存在同名冲突记录、是否有 CAA 限制。
- 外部 DNS 场景下，Cloudflare 代理状态只能是 DNS only，这不是错误，也不影响 Pages 自动证书。

> 如果以后完成备案并希望使用中国大陆节点，则属于另一套合规接入方案；当前方案仍是境外托管，不涉及备案节点。

### 5.5 部署成功后的验证

#### DNS 查询

Windows PowerShell / CMD：

```powershell
Resolve-DnsName mc.minecraftweeend.cn -Type CNAME
nslookup -type=CNAME mc.minecraftweeend.cn
```

macOS / Linux：

```bash
dig +short CNAME mc.minecraftweeend.cn
```

结果应指向你的 `<项目>.pages.dev`。如果服务商做了 CNAME 展平，CNAME 查询可能看不到原始目标，此时以浏览器和平台状态为准，并检查其他 DNS 工具。

#### 浏览器

打开：

```text
https://mc.minecraftweeend.cn/
https://mc.minecraftweeend.cn/about.html
https://mc.minecraftweeend.cn/privacy.html
https://mc.minecraftweeend.cn/this-page-does-not-exist
```

检查：

- 首页、关于、隐私政策都能打开；
- 刷新后仍然正常；
- 图标和社交分享图返回 200；
- 最后一个地址返回自定义 404 页面（HTTP 状态应为 404，而不是 200）；
- 浏览器地址栏显示 HTTPS 锁标记，没有混合内容警告；
- 手机尺寸下导航菜单、复制按钮、FAQ 都可用。

#### curl

```powershell
curl.exe -I https://mc.minecraftweeend.cn/
curl.exe -I https://mc.minecraftweeend.cn/assets/css/style.css
curl.exe -I https://mc.minecraftweeend.cn/assets/img/og-cover.png
curl.exe -s https://mc.minecraftweeend.cn/ | Select-String "方块周末"
```

期望：

- 首页 `HTTP/2 200` 或 `HTTP/1.1 200`；
- CSS 返回 `content-type: text/css`；
- PNG 返回 `content-type: image/png`；
- 页面内容能匹配到站点名称；
- 404 路径的响应状态为 404，但响应体应为自定义 404 页面。

> Cloudflare Pages 会把 `/about.html` 这类 HTML 地址自动重定向到无扩展名的 `/about`。这是平台默认行为；站内链接和 canonical 仍使用 `.html`，属于可接受的小差异。若你非常在意 SEO 的完全一致性，可以后续改成目录式路由，但要同时评估 GitHub Pages 备用部署的路径行为。

#### 常见排查

| 现象 | 优先检查 |
| --- | --- |
| 自定义域名打不开，pages.dev 正常 | CNAME 是否写对、是否已过期缓存、DNS 是否被别的同名记录占用 |
| 平台一直 Pending | 目标值是否包含 `https://`、项目名是否写错、TTL 是否还没过期 |
| HTTP 522 | 域名是否先在 Pages 中完成关联；CNAME 是否指向正确的 pages.dev |
| 证书不签发 | DNS 是否已正确解析；主域名是否存在限制性 CAA |
| 打开是 404 | 上传根目录是否直接包含 `index.html`，是否多套了一层文件夹 |
| 手机菜单无法打开 | 检查 `assets/js/main.js` 是否返回 200；是否被浏览器缓存了旧版本 |

---

## 6. 备选：腾讯云 EdgeOne Pages（海外区域）

### 6.1 创建项目并选择「全球可用区（不含中国大陆）」

1. 登录 EdgeOne 控制台 / EdgeOne Pages 控制台，创建 Pages 项目。
2. 选择导入 Git 仓库或直接上传，和你使用 Cloudflare Pages 时相同。
3. 在项目创建时的**加速区域 / 服务区域**中，必须选择：

```text
全球可用区（不含中国大陆）
```

英文界面可能写作：

```text
Global (excluding Chinese mainland)
```

> **非常关键**：不要选择「中国大陆可用区」，也不要选择「全球可用区」。根据 EdgeOne 文档，这两者添加自定义域名通常都要求先完成 ICP 备案。只有「全球可用区（不含中国大陆）」不要求备案。控制台文案可能随版本变化，以带有「不含中国大陆」或「excluding Chinese mainland」的选项为准。找不到该选项时，先联系平台支持，不要先绑定域名或上线。
>
> 如果项目已经用错区域，通常需要重新选择区域或重建项目；在绑定域名前先确认，避免白忙。

4. 完成首次部署，得到项目域名。EdgeOne 官方文档提示：对于「全球可用区（不含中国大陆）」，项目默认域名/部署域名在中国大陆网络可能返回 401；正式入口应绑定你自己的自定义域名。

### 6.2 绑定 `mc.minecraftweeend.cn`

1. 在 EdgeOne 项目里进入 **域名管理** → **添加自定义域名**。
2. 输入 `mc.minecraftweeend.cn`。
3. 建议勾选自动申请免费证书（或之后在证书配置中申请），记录平台显示的 **CNAME 目标**。
4. 目标值通常是平台分配的、形如 `xxxxxxx.dns.edgeone.site` 的主机名；**不同项目、不同账号不同，必须以控制台复制值为准，不要照抄本文示例**。
5. 到现有 DNS 服务商添加：

| 字段 | 填写内容 |
| --- | --- |
| 记录类型 | `CNAME` |
| 主机记录 | `mc` |
| 记录值 | EdgeOne 控制台给出的 CNAME 目标（例如 `xxxxxxx.dns.edgeone.site`） |
| TTL | `600` 秒，或服务商自动值 |
| 代理状态 | DNS only / 不代理（如果面板有） |

6. 回到 EdgeOne 点击验证，或等待自动检测。域名管理列表应显示 CNAME 已生效。
7. 等待免费证书签发，使用 HTTPS 访问。

注意：

- 子域名 CNAME 不会和主域名 `minecraftweeend.cn` 的其他记录冲突，但 `mc` 这个主机名本身不能还挂着旧 A/AAAA/MX/TXT 记录。
- 不需要迁移 NS，不需要把整域托管到腾讯云。
- EdgeOne 文档说明 DNS 记录生效时间最长可达 48 小时，通常几分钟到几小时；以 CNAME 实际查询结果和平台状态为准。
- 不要勾选任何中国大陆加速区域，也不要把同一个域名同时接入需要备案的中国大陆节点。

### 6.3 与 Cloudflare Pages 的差异和切换建议

| 对比项 | Cloudflare Pages | EdgeOne Pages（海外区域） |
| --- | --- | --- |
| 自定义子域名 | 外部 DNS 加 CNAME 即可 | 外部 DNS 加 CNAME |
| 是否需要迁 NS | 不需要（仅子域名） | 不需要 |
| 证书 | 平台自动签发 | 平台免费证书 / 托管证书 |
| 控制台语言 | 英文为主 | 中文控制台更友好 |
| 中国大陆访问 | 跨境线路波动 | 同样受跨境线路影响；不含大陆节点 |
| 备案 | 本方案无需 | 必须选择不含中国大陆区域；否则需备案 |

切换建议：

1. 提前 24 小时把 DNS TTL 降到 300–600 秒，缩短回滚等待时间。
2. 在两个平台都先完成部署和域名验证（不要让当前线上域名指向错误目标）。
3. 选低流量时段，修改唯一一条 CNAME：把目标从 `*.pages.dev` 换成 EdgeOne 的 CNAME 目标（或反向切换）。
4. DNS 生效后，验证 HTTPS 证书、首页、3 个页面、404 和静态资源。
5. 验证通过后，再移除旧平台上的自定义域名绑定。
6. DNS 不能同时让一个主机名使用两个不同 CNAME 目标；不要用多条 CNAME 做「灰度」。
7. 两套平台同时保留项目没问题，但自定义域名只指向其中一套；不存在「双活自动切换」。
8. 切换期间可能有短暂波动，尤其是旧 DNS TTL 还没到期时。不要把这一步放在重要活动开始前。

---

## 7. 备用：GitHub Pages

GitHub Pages 适合用来：

- 保存代码并作为 Git 源；
- 在 Cloudflare / EdgeOne 故障或需要快速切回时做临时备用；
- 不绑定自定义域名的预览测试。

**不建议**把 GitHub Pages 作为唯一生产托管：中国大陆访问 GitHub 相关域名本身可能不稳定，GitHub Pages 的带宽和构建资源也不是为高流量业务设计的。

### 7.1 推送代码并开启 Pages

```powershell
git add .
git commit -m "Update site content"
git push origin main
```

然后：

1. 打开 GitHub 仓库 → **Settings** → **Pages**。
2. 在 **Build and deployment** 中，Source 选择 **Deploy from a branch**。
3. Branch 选择 `main`，目录选择 `/ (root)`，保存。
4. 等待 Actions / Pages 构建完成。
5. 默认会得到 `https://<用户名>.github.io/<仓库名>/` 的地址。

项目已经包含：

- `CNAME`：内容为 `mc.minecraftweeend.cn`，GitHub Pages 会自动识别；
- `.nojekyll`：跳过 Jekyll 处理，避免文件被意外忽略；
- 根目录 `404.html`：GitHub Pages 会用于自定义 404。

### 7.2 在现有 DNS 服务商绑定自定义域名

GitHub Pages 的自定义子域名使用 CNAME：

| 字段 | 填写内容 |
| --- | --- |
| 记录类型 | `CNAME` |
| 主机记录 | `mc` |
| 记录值 | `<你的GitHub用户名>.github.io`（或个人主页的 GitHub Pages 域名） |
| TTL | `600` 秒，或服务商自动值 |
| 代理状态 | DNS only / 不代理（如果有） |

重要：

- 不要填写仓库 URL，也不要填 `https://` 或 `/仓库名`。GitHub Pages 需要的是 **用户名/组织的 GitHub Pages 域名**，不是项目预览路径。
- 这个 CNAME 和 Cloudflare / EdgeOne 的 CNAME 只能三选一；同一时间一个主机名只指向一个平台。
- 如果 GitHub 提示域名已被占用或需要验证，请按 GitHub 的提示在 DNS 添加验证 TXT 记录。验证 TXT 记录使用不同的主机名，不会和 `mc` 的 CNAME 冲突。
- 等 GitHub 完成域名检查后，在 Pages 设置里勾选 **Enforce HTTPS**。证书可能很快签发，也可能需要数小时到 24 小时。
- 如果此时 DNS 仍指向 Cloudflare Pages，GitHub Pages 不会接管；必须修改 CNAME。
- 从 GitHub Pages 切回 Cloudflare / EdgeOne 时，把 CNAME 目标改回对应平台分配的值，并重新等待 DNS 与证书状态。

### 7.3 路径注意事项

本项目正文页的 CSS/JS 使用相对路径，因此在 GitHub Pages 的项目子路径（`/<repo>/`）下也能打开正文页面。`404.html` 为了让任意错误深度的页面都能加载资源，使用了根路径 `/assets/...`；在未绑定自定义域名的 `*.github.io/<repo>/` 子路径下，深层 404 的样式可能加载不到。若要在该路径下长期使用，请把 `404.html` 中的根路径改为你的子路径，或直接使用自定义域名。

---

## 8. 合规与风险提示

1. **未备案使用境外托管会受网络条件影响。** 跨境线路在晚高峰可能出现延迟增大、丢包、连接不稳定或短时不可访问；不同地区、不同运营商体验差异较大。这是选择非境内节点时的客观限制。
2. **不能使用中国大陆节点规避备案。** 面向中国大陆用户提供互联网信息服务并使用境内服务器/节点时，应按要求完成 ICP 备案与相应合规手续。本文不提供任何绕过备案、隐藏源站规避监管或灰色接入的方法。
3. **如果未来需要稳定的大陆访问**，应完成 ICP 备案（以及接入商要求的其他手续），使用合规的境内服务与节点，并同步更新本项目的隐私政策、联系方式和相关声明。
4. **不要使用 Gitee Pages 绑定自定义域名。** Gitee Pages 的自定义域名通常要求完成 ICP 备案，本项目未采用。
5. **Vercel / Netlify 不作为首选。** 它们的默认可访问性与免费额度不一定适合国内访问场景；本文只在有特殊需求时把它们视为备选，并应自行评估访问速度和额度限制。当前方案优先使用 Cloudflare Pages 和 EdgeOne Pages 海外区域。
6. **平台规则会变化。** 免费额度、可用区域、备案要求、控制台文案、证书策略以你操作当天的官方页面为准。EdgeOne 尤其要确认区域是「全球可用区（不含中国大陆）」。
7. **版权与商标。** 本站与 Mojang Studios / Microsoft 无隶属关系。Minecraft 名称及相关商标归其权利人所有。页面装饰全部由 CSS 绘制，不使用官方贴图；如加入游戏截图、玩家作品或第三方素材，请先取得授权并保留来源说明。
8. **隐私写实。** 本站当前没有登录、表单、支付、数据库或主动访问分析，但托管平台仍可能处理基础访问日志和安全 Cookie。如果以后添加统计、表单、评论、广告或其他第三方服务，必须更新 `privacy.html` 并评估所需的告知/同意措施。
9. **不要用 robots.txt / 隐藏链接等方式「规避监管」。** 这不是合规方案，也可能违反平台条款或当地法律。合规问题应通过备案和合法接入解决。

---

## 9. 上线后检查清单

- [ ] 三个占位服务器卡片已换成真实信息
- [ ] 服务器地址的可见文本和 `data-copy` 一致
- [ ] QQ 群、Discord、邮箱均已替换，复制测试通过
- [ ] 公告与日期已更新，示例/占位提示已删除或替换
- [ ] 站点名称、页脚版权、法律声明已更新
- [ ] `canonical`、`og:url`、`sitemap.xml`、`robots.txt` 全部使用 `https://mc.minecraftweeend.cn`
- [ ] `CNAME` 文件内容仍为 `mc.minecraftweeend.cn`（如果继续使用 GitHub Pages）
- [ ] DNS 只有一条 `mc` 的 CNAME，目标正确，TTL 合理
- [ ] `https://mc.minecraftweeend.cn/` 返回 200，证书有效
- [ ] `/about.html`、`/privacy.html` 可访问
- [ ] 任意不存在路径返回自定义 404
- [ ] 手机（iOS Safari / Android Chrome）菜单、FAQ、复制按钮正常
- [ ] 键盘 Tab 顺序、焦点样式、Esc 关闭菜单正常
- [ ] 浏览器控制台无 JavaScript 错误
- [ ] 分享调试工具能读取到 `og-cover.png`
- [ ] 在 Google Search Console / Bing Webmaster Tools 中提交 `sitemap.xml`（可选）
- [ ] 如启用任何统计或第三方脚本，隐私政策已同步更新

---

## 10. 官方参考

- Cloudflare Pages 自定义域名（含「子域名可以不在 Cloudflare 上，使用外部 CNAME」说明）：  
  https://developers.cloudflare.com/pages/configuration/custom-domains/
- Cloudflare Pages 静态 HTML 部署：  
  https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- Cloudflare Pages 直接上传：  
  https://developers.cloudflare.com/pages/get-started/direct-upload/
- EdgeOne Pages 域名管理（加速区域与备案要求）：  
  https://edgeone.cloud.tencent.com/pages/document/162936836982489088
- EdgeOne Pages 添加自定义域名：  
  https://pages.edgeone.ai/zh/document/custom-domain
- EdgeOne Pages 配置 CNAME：  
  https://edgeone.cloud.tencent.com/pages/document/175074658405122048
- EdgeOne Pages 自定义 404：  
  https://cloud.tencent.cn/document/product/1552/127386
- GitHub Pages 自定义域名：  
  https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

> 平台界面和规则可能更新；操作时以控制台实际提示为准。
