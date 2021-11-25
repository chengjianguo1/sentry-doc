
## Hello sentry-doc!

### 1.sdk接入
```
Sentry.init({
  dsn: "http://356fd95472594d38bb91f9da6ff0f63a@39.105.175.193:9000/2",
  integrations: [new Integrations.BrowserTracing({
    routingInstrumentation: Sentry.reactRouterV5Instrumentation(history, routes, matchPath),
  })],
  environment: 'localhost',
  release: '0.0.1',
  // project: 'sentry-sdk-demo',
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
```

### 2.上传sourcemap

```
const SentryCliPlugin = require('@sentry/webpack-plugin');
module.exports = function override(config, env) {
  config.devtool = 'source-map';
  config.plugins.push(
    new SentryCliPlugin({
      release: '0.0.1',
      authToken: 'ee65f6e67a684838b0dbf793389b6041c9698cd0ad8b45138aef7dff517a6001',
      url: 'http://39.105.175.193:9000',
      org: 'sentry',
      project: 'sentry-test-react', // sentry-test-react => sentry上建的项目名称
      urlPrefix: '~/',
      include: './build',
      ignore: ['node_modules'],
    })
  );
  return config;
}
```

### 3.面包屑 Breadcrumbs
在错误详情页中，有 Breadcrumbs 信息，它非常有用，可以追踪错误发生之前的一些事件，例如点击、页面导航等。
- Breadcrumbs 是一连串的事件跟踪，展示了发生问题之前的一系列操作。这些事件与传统日志非常相似，但可以记录更丰富的结构化数据。 [Breadcrumbs 官方文档](https://docs.sentry.io/platforms/javascript/enriching-events/breadcrumbs/)

- 我们在 Sentry 管理界面，点击开之前的一个 issue 详情，可以看到 Breadcrumbs 相关信息：

##### Traces, Transactions 和 Spans

- Breadcrumbs 中第一行，被称为 Transaction ，我们先点击开这个连接，进入这个 Transaction 详情页
- 可以看到原来这是一个页面加载的过程的记录, 这个页面加载的整个过程，被称为一个Transaction

- 这个Transaction是一个树状结构，根节点是pageload，表示页面加载，根节点下有浏览器的缓存读取、DNS解析、请求、响应、卸载事件、dom内容加载事件等过程，还有各种资源加载过程

- 点击开任意一个节点，可以看到：

  - 每个节点都有一个id: Span ID
  - Trace ID: 追踪Id
  - 这个节点过程花费的时间等信息

- Sentry 把这些树状结构的节点称为 Span，他们归属于某一个 Transaction

- 一般来讲，页面加载是一个 Transaction，后端API接口逻辑是一个 Transaction，操作数据库逻辑是一个 Transaction，它们共同组成了一个 Trace

- [相关官方文档](https://docs.sentry.io/product/sentry-basics/tracing/distributed-tracing/)


## 页面加载

### 页面加载与性能指标

- 在 Sentry管理界面 -> Performance菜单 页中，可以查看每个 url 下收集的综合性能指标信息

- TPM: 平均每分钟事务数

- FCP: (First Contentful Paint) 首次内容绘制，标记浏览器渲染来自 DOM 第一位内容的时间点，该内容可能是文本、图像、SVG 甚至 元素.

- LCP: (Largest Contentful Paint) 最大内容渲染，代表在viewport中最大的页面元素加载的时间. LCP的数据会通过PerformanceEntry对象记录, 每次出现更大的内容渲染, 则会产生一个新的PerformanceEntry对象

- FID: (First Input Delay) 首次输入延迟，指标衡量的是从用户首次与您的网站进行交互（即当他们单击链接，点击按钮等）到浏览器实际能够访问之间的时间

- CLS: (Cumulative Layout Shift) 累积布局偏移，总结起来就是一个元素初始时和其hidden之间的任何时间如果元素偏移了, 则会被计算进去, 具体的计算方法可看这篇文章 https://web.dev/cls/

- FP: First Paint (FP) 首次绘制，测量第一个像素出现在视口中所花费的时间，呈现与先前显示内容相比的任何视觉变化。这可以是来自文档对象模型 (DOM) 的任何形式，例如 background color 、canvas 或 image。FP 可帮助开发人员了解渲染页面是否发生了任何意外。

- TTFB: Time To First Byte (TTFB) 首字节时间，测量用户浏览器接收页面内容的第一个字节所需的时间。TTFB 帮助开发人员了解他们的缓慢是由初始响应(initial response)引起的还是由于渲染阻塞内容(render-blocking content)引起的

- USER MISERY: 对响应时间难以容忍度的用户数，User Misery 是一个用户加权的性能指标，用于评估应用程序性能的相对大小。虽然可以使用 Apdex 检查各种响应时间阈值级别的比率，但 User Misery 会根据满意响应时间阈值 (ms) 的四倍计算感到失望的唯一用户数。User Misery 突出显示对用户影响最大的事务。可以使用自定义阈值为每个项目设置令人满意的阈值。阈值设置在Settings -> sentry -> cra-test -> Performance


## Performance 面板

### 在 Performance 面板中，可以根据一些条件查询某一批 Transaction的：

1. FCP、LCP、FID、CLS等信息
  - 每个卡片上还有绿色、黄色、红色的百分比，分别表示好、一般和差，通过该性能指标的阈值作区分
  - sentry 性能指标阈值定义
    |Web Vital	|Good(绿色)	|Meh(黄色)	|Poor(红色) |
    |----|----|----|----|
    |最大内容绘制 (LCP)	|<= 2.5s	|<= 4s	|> 4s|
    |首次输入延迟 (FID)	|<= 100ms		|<= 300ms		|> 300ms|
    |累积布局偏移 (CLS)		|<= 0.11s		|<= 0.25	|> 0.25 |
    |首次绘制 (FP)		|<= 1s			|<= 3s			|> 3s |
    |最大内容绘制 (LCP)	|<= 0.1s			|<= 3s		|> 3s |
    |首字节时间 (TTFB)			|<= 100ms				|<= 200ms	|> 600ms|
    [官方文档](https://docs.sentry.io/product/performance/web-vitals/)

2. LCP p75面积图、LCP Distribution数量柱状图、TPM面积图
  - LCP p75面积图: p50、p75、p95都对应一个时间长度的值(例如 277.20ms)，表示在某一段时间内(例如2021-10-19 2:35 PM 到 2021-10-19 2:40 PM)，采集的所有transaction中(例如采集到了11个 transaction)，超过25%的 transaction 样本的LCP值超过了277.20ms。官方文档

  - LCP Distribution数量柱状图: 横坐标是LCP时间(单位s)，纵坐标是数量(单位个)。一个柱子，表示某个LCP时间的 transaction 数量

  - TPM面积图: 平均每分钟的 transaction 数量。例如，在 4:00 PM 到 8:00 PM时间段内，平均每分钟的 transaction 数量是0.213个

### Failure Rate 失败率

failure_rate() 表示不成功 transaction 的百分比。Sentry 将状态为 “ok”、“canceled” 和 “unknown” 以外的 transaction 视为失败。更多状态可以参考 [文档](https://develop.sentry.dev/sdk/event-payloads/span/)。











