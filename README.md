# 周末愉快 · Minecraftweekend

一个 Minecraft 生存服务器与社区信息页，当前通过 **GitHub Pages** 发布。

- 线上地址：<https://mc.minecraftweekend.cn/>
- GitHub 仓库：<https://github.com/Yuexiuxiu/MinecraftWeekend>
- 技术栈：纯 HTML + CSS + JavaScript，无框架、无构建步骤、无后端、无数据库、无登录、无支付。
- 视觉：深色 Minecraft 像素方块风格；草方块、树、云、404 方块等装饰均由 CSS 绘制。
- 当前服务器信息：**周末愉快 / Minecraftweekend**，版本 **26.50**，生存模式，只有一个服务器，无需正版验证。
- 加入方式：QQ 群 `870774459`；QQ 频道 `cdcvk4521a`；邮箱 `lingyueyue148@163.com`。

> 代码中没有服务器 IP 或连接地址。页面统一提示“进群获取地址”，这是有意为之；
> 如果要公开服务器地址，请同时修改首页服务器卡片和 FAQ。

---

## 1. 当前文件结构

```text
D:\Website\
├─ index.html                    # 首页
├─ about.html                    # 关于周末愉快
├─ privacy.html                  # 隐私政策
├─ 404.html                      # 自定义 404（使用根路径资源）
├─ assets/
│  ├─ css/
│  │  └─ style.css               # 全站样式与响应式
│  ├─ js/
│  │  └─ main.js                 # 导航、二维码面板、滚动高亮、复制等
│  └─ img/
│     ├─ favicon.svg             # 草方块图标
│     ├─ og-cover.png            # 1200×630 社交分享封面
│     ├─ qq-group-qr.png        # QQ 群二维码（已裁剪、保留扫码留白）
│     └─ qq-channel-qr.png      # QQ 频道二维码
├─ robots.txt
├─ sitemap.xml
├─ CNAME                         # GitHub Pages 自定义域名
├─ .nojekyll                     # 跳过 GitHub Pages 的 Jekyll 处理
└─ README.md
```

---

## 2. 本次内容改造说明

### 已完成的调整

1. 站点和服务器品牌改为 **周末愉快 / Minecraftweekend**。
2. 首页宣传语改为：

   > 愉快留在周末，用方块搭建我的世界

   “方块”两个字使用荧光绿背景块高亮。
3. 服务器信息改为只有一个服务器：
   - 名称：周末愉快
   - 英文名：Minecraftweekend
   - 模式：生存
   - 版本：26.50
   - 正版验证：不需要
   - 地址：加入 QQ 群获取
4. 联系方式：
   - QQ 群：`870774459`
   - QQ 频道：`cdcvk4521a`
   - 邮箱：`lingyueyue148@163.com`
5. 顶部导航“加入社区”：
   - 桌面端鼠标悬停显示二维码；
   - 点击也能打开二维码；
   - 手机端点按打开；
   - 同时展示 QQ 群和 QQ 频道二维码。
6. 加入社区区域直接展示两张二维码，群号和频道号可以复制。
7. 顶部导航新增**滚动高亮**：
   - 阅读首页、服务器、公告、FAQ、加入社区等区域时，导航会自动移动到对应高亮状态；
   - 各章节通过 `data-spy-target` 与页面区块关联。
8. FAQ 已更新：
   - 不需要正版，提醒保护装备、谨防同名玩家顶替；
   - 游戏服务器位于国内，正常可直连；
   - 页面使用 GitHub Pages 托管，网页加载速度仍可能受到跨境线路影响。
9. 域名与 CNAME 更新为 `mc.minecraftweekend.cn`。
10. `robots.txt`、`sitemap.xml`、canonical、Open Graph、JSON-LD 全部同步新域名。
11. 重新生成了 OG 分享封面和 QQ 二维码资源。

---

## 3. 本地预览

项目不需要安装依赖或构建。进入目录后启动静态服务器：

```powershell
cd D:\Website
python -m http.server 8080 --bind 127.0.0.1
```

浏览器打开：

```text
http://127.0.0.1:8080/
```

也可以使用：

```bash
npx serve .
```

不要直接双击 HTML 文件，因为 `404.html` 和部分根路径链接需要通过 HTTP 服务器访问。

---

## 4. 如何把更新发布到 GitHub Pages

这个目录不是自动同步的 Git 工作副本。请把以下文件上传/推送到
<https://github.com/Yuexiuxiu/MinecraftWeekend> 的 `main` 分支：

```text
index.html
about.html
privacy.html
404.html
assets/css/style.css
assets/js/main.js
assets/img/og-cover.png
assets/img/favicon.svg
assets/img/qq-group-qr.png
assets/img/qq-channel-qr.png
robots.txt
sitemap.xml
CNAME
.nojekyll
README.md
```

### 使用 Git 命令行

在你本地的仓库副本中：

```powershell
git add .
git commit -m "更新周末愉快网站内容与二维码"
git push origin main
```

### 使用 GitHub 网页上传

1. 打开仓库；
2. 进入要替换的文件；
3. 使用右上角 **Edit** 或 **Upload files** 上传；
4. 保持原有目录结构，尤其是 `assets/img/` 下的二维码文件；
5. 提交到 `main` 分支。

GitHub Pages 通常会在推送后几分钟内自动重新发布。刷新线上页面时建议使用：

```text
Ctrl + F5
```

避免浏览器或 CDN 缓存导致看到旧版本。

> 本次修改无法直接推送到你的 GitHub 仓库：当前环境没有该仓库的 Git 凭据。
> 请用上述任一方式提交文件，提交后线上会自动更新。

---

## 5. GitHub Pages 与域名配置

### 5.1 当前仓库设置

在 GitHub 仓库中确认：

1. **Settings → Pages**
2. Source：**Deploy from a branch**
3. Branch：`main`
4. Folder：`/ (root)`
5. Custom domain 填：`mc.minecraftweekend.cn`
6. 等 DNS 检查通过后勾选 **Enforce HTTPS**

仓库根目录的 `CNAME` 文件内容已经是：

```text
mc.minecraftweekend.cn
```

### 5.2 现有 DNS 服务商需要保持的记录

| 字段 | 填写内容 |
| --- | --- |
| 记录类型 | `CNAME` |
| 主机记录 | `mc` |
| 记录值 | `yuexiuxiu.github.io` |
| TTL | `600` 秒或自动 |
| 代理状态 | DNS only / 不代理（如果有） |

说明：

- 不要填仓库地址、`https://` 或 `/MinecraftWeekend`。
- 同一个 `mc` 主机名不要同时保留旧的 A / AAAA / CNAME 记录。
- DNS 生效时间从几分钟到数小时不等；GitHub 证书签发可能还需要一段时间。
- 如果之后更换 GitHub 用户名或域名，需要同步修改 `CNAME`、DNS、canonical、OG、Sitemap 和 robots。

---

## 6. 以后如何修改内容

### 6.1 修改服务器版本号

当前版本号是 `26.50`，出现在：

- `index.html` 首页 Hero 文案、世界卡片、服务器卡片、FAQ；
- `about.html` 页面介绍、侧栏；
- `README.md`；
- 首页 JSON-LD 的 FAQ 文本；
- OG 分享图 `assets/img/og-cover.png`（图片需重新导出）。

如果版本升级，建议先在项目里搜索：

```powershell
Select-String -Path *.html,README.md -Pattern '26\.50'
```

然后同步修改所有位置。版本号只是一行文案，页面本身不读取服务器状态。

### 6.2 更换 QQ 群 / 频道 / 邮箱

当前值：

```text
QQ 群：870774459
QQ 频道：cdcvk4521a
邮箱：lingyueyue148@163.com
```

涉及位置：

- `index.html` 顶部二维码面板、服务器卡片、加入社区区、FAQ、页脚；
- `about.html` 加入说明、联系方式、侧栏、页脚；
- `privacy.html` 联系我们、页脚；
- `404.html` 顶部二维码面板、页脚；
- 各页二维码图片 `assets/img/qq-group-qr.png`、`assets/img/qq-channel-qr.png`。

复制按钮需要同时修改可见文本和按钮上的 `data-copy`：

```html
<strong>870774459</strong>
<button
  class="copy-btn"
  type="button"
  data-copy="870774459"
  data-copy-name="QQ 群号">
  复制
</button>
```

### 6.3 更换二维码图片

当前使用的是已经裁剪好的两张图：

- `assets/img/qq-group-qr.png`
- `assets/img/qq-channel-qr.png`

替换时建议：

- 保持文件名不变，避免同时修改多处 HTML；
- 使用 PNG 或 WebP；
- 保留二维码四周的白色留白（静区），不要把图案裁得太贴边；
- 手机扫码测试通过后再提交；
- 页面中每张二维码的 `alt` 文本也要和实际内容一致。

### 6.4 修改首页宣传语

首页宣传语位于 `index.html`：

```html
<h1 class="hero-title" id="hero-title">
  愉快留在周末，<br>
  用<span class="highlight">方块</span>搭建<br>
  我的世界
</h1>
```

- `class="highlight"` 就是荧光绿背景块；
- 如果修改宣传语，注意测试桌面与手机端换行；
- 同步更新 `<title>`、`meta description`、Open Graph 和 JSON-LD 中的站点描述。

### 6.5 滚动高亮

首页导航按钮和链接通过以下属性与章节关联：

```html
<a href="#servers" data-spy-target="#servers">服务器</a>
```

对应区块必须有相同的 `id`：

```html
<section id="servers">...</section>
```

如果要新增导航项：

1. 给目标区块增加唯一 `id`；
2. 给导航项增加 `data-spy-target="#那个id"`；
3. 保持导航顺序与页面阅读顺序大致一致；
4. 重新验证滚动高亮。

### 6.6 二维码弹层

顶部导航的二维码面板由以下结构组成：

```html
<div class="nav-qr-wrap" data-qr-root>
  <button data-qr-trigger aria-expanded="false" aria-controls="nav-qr-panel">加入社区</button>
  <div id="nav-qr-panel" data-qr-panel hidden>...</div>
</div>
```

`assets/js/main.js` 同时处理：

- 桌面端 `mouseenter` 打开；
- 按钮点击/触屏点按切换；
- 点击外部、按 Esc、焦点移出后关闭；
- 移动端菜单收起时自动关闭二维码。

---

## 7. 上线前检查清单

- [ ] 首页、关于、隐私政策、404 正常打开
- [ ] 首页宣传语与“方块”荧光绿高亮正确
- [ ] 全站只有“周末愉快”这一个服务器
- [ ] 版本号 26.50 在所有位置一致
- [ ] QQ 群 870774459 可复制
- [ ] QQ 频道 cdcvk4521a 可复制
- [ ] 邮箱 lingyueyue148@163.com 的 `mailto:` 可打开
- [ ] 顶部导航“加入社区”悬停/点击能显示两张二维码
- [ ] 安卓/iOS 点按菜单里的“加入社区”能显示二维码
- [ ] 两张二维码都能被手机实际扫描
- [ ] 页面滚动时顶栏高亮会随章节移动
- [ ] 手机端没有横向滚动条
- [ ] 404 页面与所有资源正常
- [ ] `CNAME` 仍为 `mc.minecraftweekend.cn`
- [ ] `robots.txt`、`sitemap.xml` 使用新域名
- [ ] https://mc.minecraftweekend.cn/ 证书有效
- [ ] GitHub 仓库已提交并触发 Pages 重新发布

### 快速排查

| 现象 | 检查 |
| --- | --- |
| 页面还是旧内容 | 等 GitHub Pages 构建完成，使用 Ctrl+F5；检查仓库 `main` 是否已更新 |
| 二维码弹层不出现 | 确认 `assets/js/main.js` 已上传；查看浏览器控制台 |
| 二维码扫不出来 | 确认图片未被错误裁剪或压缩；保留白色留边 |
| 导航高亮不移动 | 检查 `data-spy-target` 与区块 `id` 是否完全一致 |
| 自定义域名失效 | 检查仓库根目录 `CNAME` 内容，以及 DNS 的 CNAME 是否指向 `yuexiuxiu.github.io` |
| HTTPS 未生效 | 等 GitHub 证书签发；Custom domain 检查通过后再启用 Enforce HTTPS |

---

## 8. 合规与风险提示

1. **网站与游戏服务器分离。** 当前网页使用 GitHub Pages 托管在境外；游戏服务器按你的说明位于国内。两者使用不同托管与网络路径，网页访问速度与游戏连接速度不能直接等同。
2. **网页可能受跨境线路影响。** GitHub Pages 在中国大陆的访问速度和稳定性可能波动；如果网页也需要境内稳定访问，应完成 ICP 备案并使用合规的境内托管，不能使用绕过备案的方式。
3. **游戏服务器需遵守其自身的接入、备案与运营要求。** 本文不提供规避监管或灰色接入方法；请按实际服务商和适用规则自查。
4. **无需正版验证的服务器存在同名顶替风险。** 页面已明确提示玩家保护装备，发现异常及时联系管理员。
5. **隐私说明要与实际一致。** 页面当前没有登录、表单、支付、独立统计或数据库；托管方仍可能记录基础访问日志。若加入统计、评论或其他第三方脚本，请更新 `privacy.html`。
6. **版权与商标。** 本页不是 Mojang 官方页面，与 Mojang Studios / Microsoft 无隶属关系；Minecraft 名称及相关商标归其权利人所有。页面装饰由 CSS 绘制，不包含 Mojang 官方贴图。

---

## 9. 官方参考

- GitHub Pages 自定义域名：  
  <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site>
- GitHub Pages 使用限制：  
  <https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits>
- GitHub 隐私声明：  
  <https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement>
