# 心理健康咨询服务系统

面向心理健康服务场景的全栈系统，包含三端：

| 端         | 目录                 | 技术栈                                                                       | 使用角色                  |
| ---------- | -------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| 后端 API   | `springboot-server/` | **Spring Boot 2.7 + MyBatis-Plus + Spring Security + JWT + MySQL**（JDK 11） | 为 Web 端和小程序提供接口 |
| Web 管理端 | `src/`               | Vue 3 + TypeScript + Vite + Element Plus + Pinia                             | 心理咨询师、系统管理员    |
| 微信小程序 | `miniprogram/`       | 原生微信小程序（兼容写法）                                                   | 普通用户                  |

> `server/` 目录是项目早期的 Node.js + Express 参考实现，接口与 Spring Boot 版完全一致，目前**保留它仅用于执行演示数据初始化脚本（seed）**，日常启动请使用 Spring Boot，两者都占用 3000 端口，切勿同时运行。

数据库脚本在 `database/`。

## 功能清单

- **心理咨询师（Web）**：工作台数据统计（咨询次数、评分反馈、趋势图）、用户心理健康档案与测评结果查看、预约处理（通过/驳回/完成）、在线回复咨询并归档咨询过程与结果、查看用户历史咨询、科普文章发布维护
- **系统管理员（Web）**：用户管理、咨询师账号与权限管理、预约审核、测评题库管理（量表/题目/评分区间规则）、文章与系统公告管理、系统运行数据统计
- **用户（小程序）**：微信登录、心理测评（PHQ-9/GAD-7，服务端自动计分判级）、咨询预约、在线提问与消息沟通、咨询评价、科普文章阅读、个人心理档案维护

## 一、数据库准备（MySQL 8.0）

### 1. 建库建表（只需执行一次）

先确保 MySQL 服务已启动，然后执行建表脚本（任选一种）：

```powershell
# 方式 A：命令行（PowerShell 不支持 < 重定向，用管道）
Get-Content -Raw -Encoding UTF8 database\schema.sql | mysql -u root -p

# 方式 B：用 Navicat / DataGrip 等工具打开 database/schema.sql 直接运行
```

脚本会自动创建 `mental_health` 数据库和 12 张表。

> ⚠️ `schema.sql` 带 `DROP TABLE IF EXISTS`，重复执行会清空数据，仅在首次建库或确认要重置时执行。

### 2. 初始化演示数据

演示数据脚本仍使用 Node 版的 seed（只需执行一次；生成的 bcrypt 密码哈希与 Spring Security 完全兼容）：

```powershell
cd server
npm.cmd install       # 安装 mysql2 / bcryptjs 等
npm.cmd run seed      # 写入演示数据后即可关闭，不需要 npm run dev
```

演示账号：

- 管理员：`admin` / `admin123`
- 咨询师：`counselor1`（或 counselor2、3）/ `123456`
- 小程序开发模式：昵称输入「小明 / 阿悦 / 老张」可对上演示用户

### 3. 配置数据库连接

打开 [application.yml](springboot-server/src/main/resources/application.yml)，按本机 MySQL 修改：

```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/mental_health?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
    username: root
    password: 123456
```

## 二、启动 Spring Boot 后端（推荐用 IDEA）

环境要求：**JDK 11**（Spring Boot 2.7.18；不要用 JDK 17 以上的 Boot 3.x 配置），Maven 3.6+（IDEA 内置 Maven 即可）。

1. 打开 IntelliJ IDEA → `File → Open`，选择 **`springboot-server` 文件夹**（选中该目录后点 OK，以 Maven 工程导入）；
2. 等待右下角 Maven 依赖下载完成（`pom.xml` 已声明 spring-boot-starter-web / security / validation、mybatis-plus、mysql-connector-j、jjwt）；
3. 确认 Project SDK 为 JDK 11（`File → Project Structure → Project SDK`）；
4. 运行启动类 [MentalHealthApplication.java](springboot-server/src/main/java/com/mentalhealth/MentalHealthApplication.java)（点类名旁绿色三角）。

控制台出现 `Started MentalHealthApplication` 即启动成功，服务地址：**http://127.0.0.1:3000/api**，健康检查：http://127.0.0.1:3000/api/health 。

> 命令行启动（装有 Maven 时）：在 `springboot-server` 目录执行 `mvn spring-boot:run`。
> 注意：必须先确保旧 Node 服务（`server/`）已停止，否则 3000 端口冲突。

### 微信小程序配置（可选）

在 [application.yml](springboot-server/src/main/resources/application.yml) 中：

```yaml
wechat:
  appid: '' # 留空走开发模式：openid = dev_昵称，方便本地调试
  secret: '' # 填入正式 AppID/AppSecret 后，走微信 jscode2session 真实登录
```

JWT 密钥配置在同一文件的 `jwt.secret`（jjwt 要求至少 32 个字符）；更换密钥后已签发的旧 token 会失效，前端会自动跳回登录页。

## 三、启动 Web 管理端

```powershell
# 在项目根目录
npm.cmd install
npm.cmd run dev
```

浏览器打开 Vite 提示的地址（默认 http://localhost:5173 ，被占用时会自动顺延端口），会自动跳转到登录页。
Web 端通过 Vite 代理访问后端（配置见 [vite.config.ts](vite.config.ts)）：前端请求 `/api/xxx` 会被代理到 `http://127.0.0.1:3000/api/xxx`，因此不存在跨域问题。注意代理**不要**加 `rewrite`，后端 `context-path` 本身就带 `/api` 前缀。

## 四、连接微信小程序

### 1. 导入项目

1. 打开「微信开发者工具」→ 导入项目，目录选择本项目的 **`miniprogram` 文件夹**（不是项目根目录）；
2. AppID 可先选「测试号」（项目默认 `touristappid`），有正式 AppID 时在 `project.config.json` 和小程序后台替换；
3. 勾选：**详情 → 本地设置 → 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**（否则无法请求 `http://localhost`）。

### 2. 配置后端地址

编辑 [miniprogram/utils/api.js](miniprogram/utils/api.js) 顶部：

```js
// 开发者工具模拟器：用 127.0.0.1
var BASE_URL = 'http://127.0.0.1:3000/api'

// 真机预览：改成电脑的局域网 IP（手机和电脑连同一个 WiFi），例如：
// var BASE_URL = 'http://192.168.1.10:3000/api'

// 正式上线：必须是 https 域名
// var BASE_URL = 'https://你的域名/api'
```

查电脑局域网 IP：PowerShell 执行 `ipconfig`，找 IPv4 地址；同时 Windows 防火墙要放行 3000 端口。

### 3. 联调链路

```
小程序页面 → utils/api.js（wx.request + JWT）→ http://IP:3000/api → Spring Boot Controller → MySQL
Web 页面  → utils/request.ts（axios + JWT）→ /api（Vite 代理）→ Spring Boot Controller → MySQL
```

## 五、后端工程结构

```
springboot-server/
├── pom.xml                       # Spring Boot 2.7 / MyBatis-Plus / Security / JJWT
└── src/main/
    ├── resources/application.yml # 端口 3000 + context-path /api、数据源、JWT、微信配置
    └── java/com/mentalhealth/
        ├── MentalHealthApplication.java  # 启动类（@MapperScan）
        ├── common/            # Result 统一响应、Json 请求体工具、Dates 日期解析
        ├── config/            # SecurityConfig（JWT 无状态鉴权 + CORS）、JacksonConfig、全局异常处理
        ├── security/          # JwtUtil、JwtAuthenticationFilter、LoginUser、SecurityUtil
        ├── entity/            # 12 张表对应的实体类
        ├── mapper/            # MyBatis-Plus BaseMapper
        └── controller/        # 9 个业务模块 Controller（auth/counselors/users/appointments/
                               #   consultations/assessments/articles/announcements/stats）
```

接口统一响应格式 `{ code: 0, message, data }`（code=0 成功，401 未登录，403 无权限）；Java 驼峰字段通过 Jackson 的 `SNAKE_CASE` 策略自动输出下划线字段，与前端契约一致；量表的 `levels`、题目的 `options`、答卷的 `answers` 为 JSON 列，按字符串透传并在业务层解析。

## 常见问题

1. **IDEA 启动报数据库连接失败**：检查 MySQL 服务是否启动、`application.yml` 的账号密码是否正确、是否已执行 `schema.sql`。
2. **端口 3000 被占用**：旧 Node 服务没关（在其终端按 Ctrl+C），或检查是否有重复启动的 Spring Boot 进程。
3. **页面/小程序提示「无法连接服务器」**：确认 Spring Boot 已启动且 `/api/health` 可访问；真机预览确认 BASE_URL 是局域网 IP 而非 127.0.0.1。
4. **PowerShell 中 npm 命令报脚本执行策略错误**：改用 `npm.cmd install` / `npm.cmd run seed`。
5. **登录提示 401 后跳回登录页**：`jwt.secret` 变更或过期会导致旧 token 失效，重新登录即可。
6. **重置演示数据**：重新执行 `database/schema.sql`（会清库）后，再到 `server/` 执行 `npm.cmd run seed`。
