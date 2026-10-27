# WEBSOCKET_PROTOCOL.md

## 连接

```
ws://api.t-lyrics.com/ws?vehicleId={vehicleId}
```

认证：通过 HttpOnly Cookie 或 Authorization Header 携带会话令牌。

## 消息格式

所有消息为 JSON，包含 `type` 字段。

### 服务端 → 客户端

#### 1. snapshot（首次连接或重连时推送）

```json
{
  "type": "snapshot",
  "snapshot": { /* CanonicalMediaSnapshot */ }
}
```

#### 2. media_update（增量更新）

```json
{
  "type": "media_update",
  "generation": 5,
  "trackInstanceId": "inst_abc123",
  "changes": {
    "playbackState": "paused",
    "timeAnchor": { ... }
  }
}
```

#### 3. lyrics_ready

```json
{
  "type": "lyrics_ready",
  "generation": 6,
  "trackFingerprint": "fp_xyz",
  "lyrics": {
    "lrc": "[00:12.50]歌词内容...",
    "source": "lrclib"
  }
}
```

#### 4. error

```json
{
  "type": "error",
  "code": "NO_LYRICS" | "AUTH_EXPIRED" | "VEHICLE_OFFLINE",
  "message": "..."
}
```

### 客户端 → 服务端

#### 1. select_lyrics

```json
{
  "type": "select_lyrics",
  "trackFingerprint": "fp_xyz",
  "lyricsVersionId": "lv_001"
}
```

#### 2. adjust_offset

```json
{
  "type": "adjust_offset",
  "offsetMs": -500
}
```

#### 3. ping

```json
{ "type": "ping" }
```

## 行为规则

- 连接成功后，服务端必须立即发送 `snapshot`。
- 客户端只应用 `generation` 大于本地当前值的更新。
- 断线后采用指数退避重连，重连成功后再次请求快照。
- 不要求客户端每秒上报进度；进度由本地时钟推算。

## 后续

实现时需要配合前端的 `performance.now()` 推算逻辑，确保暂停、切歌、重连时状态正确恢复。
