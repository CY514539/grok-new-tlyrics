# ARCHITECTURE.md

## 总体架构

```
Tesla Vehicle
    ↓ (Fleet Telemetry / Media events)
Telemetry Receiver (单一 Token Refresh Owner)
    ↓
Media Event Normalizer + Merger
    ↓
Redis Streams / Canonical Media Snapshot
    ↓
Media Worker (歌词匹配、版本控制)
    ↓
API Gateway + WebSocket
    ↓
Browser Player (Tesla 车载 / 桌面 / 移动)
```

## 关键设计原则

1. **单一 Token Refresh Owner**  
   所有 Tesla Token 刷新由一个受控服务负责，避免多实例冲突。

2. **事件驱动，非轮询**  
   不持续订阅高频 Elapsed。依赖歌曲信息事件 + 本地时钟 + 可靠时间锚点。

3. **Canonical Media Snapshot**  
   每辆车维护一份权威媒体快照（歌曲身份、状态、歌词版本、时间锚点、Generation ID）。

4. **Track Fingerprint + Track Instance ID + Generation**  
   - Fingerprint：标准化后的歌曲身份（标题+歌手+时长等）
   - Instance ID：一次播放实例
   - Generation：递增版本号，防止旧异步结果覆盖新歌曲

5. **歌词匹配优先级**  
   用户手动映射 > 高置信度缓存 > LRCLIB 自动搜索 > 降级供应商

6. **免费额度后端强制**  
   按账号 + 标准化歌曲身份 + 播放实例计数，禁止前端计数。

7. **严格隔离**  
   用户、车辆、WebSocket Channel、歌词状态、Token 全部隔离。

## 核心数据流

### 媒体事件到达
1. Receiver 接收并验证来源
2. 标准化字段（Title / Artist / Album / Duration / State）
3. 合并短时间内分批到达的事件
4. 生成/更新 Canonical Snapshot
5. 推送 WebSocket + 写入 Redis

### 歌词同步
1. 前端取得可信时间锚点后，使用 `performance.now()` 本地推算进度
2. 暂停时停止推进，恢复时继续
3. 切歌时重置身份与进度
4. 用户可手动偏移，但有冷却限制

## 部署边界

| 域名 | 用途 |
|------|------|
| t-lyrics.com | Landing |
| app.t-lyrics.com | 播放器 |
| api.t-lyrics.com | API |
| telemetry.t-lyrics.com | Telemetry 入口 |
| admin.t-lyrics.com | 管理后台 |
| beta.t-lyrics.com | 测试环境 |

生产与测试环境隔离会话、Redis、WebSocket，但共享 Telemetry Receiver 时必须确保只有一个 Token Refresh Owner。

## 安全

- Tesla Token 加密存储
- HttpOnly Cookie + CSRF 防护
- 最小权限 Scope
- Webhook 签名验证（Stripe）
- 敏感数据脱敏
