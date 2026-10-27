# MOCK_STRATEGY.md

## 目标

在没有真实 Tesla 车辆的情况下，完整跑通「媒体事件 → 歌曲识别 → 歌词匹配 → 同步显示」路径。

## Mock 事件格式

```json
{
  "vehicle_id": "mock-vehicle-001",
  "timestamp": 1730000000000,
  "fields": {
    "MediaNowPlayingTitle": "Example Song",
    "MediaNowPlayingArtist": "Example Artist",
    "MediaNowPlayingAlbum": "Example Album",
    "MediaNowPlayingDuration": 215,
    "MediaPlaybackStatus": "Playing"
  },
  "generation": 1
}
```

## 使用方式（规划）

1. 本地 Mock Sender 向 Receiver 发送上述事件
2. 支持：切歌、暂停、恢复、同一首歌重复播放
3. 明确标注所有 Mock 路径，禁止伪装成真实 Telemetry

## 后续

- 提供一个简单的 CLI 或 HTTP 端点用于手动触发 Mock 事件
- 支持从文件批量回放事件序列
