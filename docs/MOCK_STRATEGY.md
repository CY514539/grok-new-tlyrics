# MOCK_STRATEGY.md

## 目标

在没有真实 Tesla 车辆的情况下，完整跑通「媒体事件 → 歌曲识别 → 歌词匹配 → 同步显示」路径。

**重要**：所有 Mock 路径必须明确标注，禁止伪装成真实 Tesla Telemetry。

## Mock 事件格式

```json
{
  "source": "mock",
  "vehicle_id": "mock-vehicle-001",
  "timestamp": 1730000000000,
  "generation": 1,
  "fields": {
    "MediaNowPlayingTitle": "Example Song",
    "MediaNowPlayingArtist": "Example Artist",
    "MediaNowPlayingAlbum": "Example Album",
    "MediaNowPlayingDuration": 215,
    "MediaPlaybackStatus": "Playing"
  }
}
```

## 支持的事件类型

| 类型 | 说明 | 关键字段 |
|------|------|----------|
| `song_start` | 新歌开始播放 | title, artist, album, duration |
| `song_change` | 切歌 | 同上 |
| `pause` | 暂停 | MediaPlaybackStatus: Paused |
| `resume` | 恢复 | MediaPlaybackStatus: Playing |
| `seek` | 进度跳转（可选） | elapsed_sec |

## 使用方式

见 `tools/mock-sender/` 目录下的最小发送工具。

## 后续计划

- 支持从 JSON 文件批量回放事件序列
- 与真实 Receiver 接口对齐后，Mock Sender 可直接打到本地后端
