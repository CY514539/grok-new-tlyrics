# grok-new-tlyrics

**Live Lyrics for Tesla** — 干净重做版本。

通过 Tesla 官方 Fleet API / OAuth / Fleet Telemetry，实时识别车辆正在播放的歌曲，并在车载浏览器中以 KTV 风格显示同步歌词。

## 核心原则

- 不接管音频，音乐始终由汽车原有系统播放。
- 严格最小权限（openid、offline_access、vehicle_device_data）。
- 事件驱动，不轮询，不主动唤醒车辆。
- 状态版本控制 + Track Instance ID，防止旧结果覆盖新歌曲。
- 免费用户每日 4 首，Pro 无限。
- 所有用户/车辆/歌词数据严格隔离。

## 当前状态

见 [CURRENT_STATE.md](./CURRENT_STATE.md)

## 项目大脑（必须先读）

| 文件 | 说明 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 整体架构与数据流 |
| [DATA_MODEL.md](./DATA_MODEL.md) | 核心实体与隔离规则 |
| [CURRENT_STATE.md](./CURRENT_STATE.md) | 实时进度 |
| [DECISIONS.md](./DECISIONS.md) | 关键决策日志 |
| [ACCEPTANCE.md](./ACCEPTANCE.md) | 核心场景验收标准 |
| [docs/MOCK_STRATEGY.md](./docs/MOCK_STRATEGY.md) | Mock 媒体事件方案 |

## 技术栈（规划）

- **Frontend**: React + TypeScript + Vite（适配 Tesla 横屏浏览器）
- **Backend**: Node.js / TypeScript 或 Go
- **实时**: WebSocket + Redis Streams
- **数据**: PostgreSQL / SQLite + Redis
- **支付**: Stripe
- **部署**: Docker + Caddy / 云 VPS

## 开发流程

1. 先完善项目大脑文件
2. 按垂直切片推进（Mock 路径优先）
3. 小步提交，强制回归检查
4. 真实 Tesla 联调放在后期

---

*本仓库由 Grok 协助从零干净重做，目标是可商业化的稳定版本。*
