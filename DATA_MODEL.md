# DATA_MODEL.md

## 核心实体

### Account
- id, user_id (可读短 ID), email, created_at
- 关联 Tesla Authorization、Subscription、Free Usage

### TeslaAuthorization
- account_id
- access_token (encrypted)
- refresh_token (encrypted)
- scopes
- expires_at
- last_refreshed_at

### Vehicle
- vin (masked in logs)
- account_id
- name, model, firmware
- selected (当前选中)

### CanonicalMediaSnapshot
- vehicle_id
- track_fingerprint
- track_instance_id
- generation
- title, artist, album, duration_sec
- playback_state (playing / paused)
- time_anchor (server_time + elapsed_at_anchor)
- lyrics_mapping_id (nullable)
- updated_at

### LyricsMapping
- account_id + track_fingerprint → lyrics_version_id
- 用户手动选择优先

### LyricsCache
- fingerprint → candidate list / verified LRC
- 成功缓存、受限失败缓存、手动上传

### FreeUsage
- account_id + date (时区明确)
- track_fingerprint 集合（每日最多 4 首）

### Subscription
- stripe_customer_id
- stripe_subscription_id
- status (free / active / trialing / past_due / canceled / expired)
- current_period_end

### WebhookEvent
- stripe_event_id (unique, 幂等)
- processed_at

## 隔离与约束

- 所有查询必须带 account_id 或 vehicle_id
- Track Instance + Generation 防止竞态覆盖
- 免费额度按「标准化歌曲身份」去重，同一首歌循环不重复扣
- Token 仅服务端可见，永不下发前端

## 索引建议

- (account_id, vehicle_id)
- (track_fingerprint)
- (account_id, date) on FreeUsage
- Unique: stripe_event_id
