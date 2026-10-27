# CANONICAL_SNAPSHOT.md

## 目的

每辆车维护一份**权威媒体快照**（Canonical Media Snapshot），作为前端首次连接和重连时的单一事实来源。

## 结构（建议）

```ts
interface CanonicalMediaSnapshot {
  vehicleId: string;
  accountId: string;

  // 歌曲身份
  trackFingerprint: string;          // 标准化后的歌曲唯一标识
  trackInstanceId: string;           // 一次播放实例（切歌或重播时变更）
  generation: number;                // 递增版本号，防止旧结果覆盖

  // 媒体信息
  title: string | null;
  artist: string | null;
  album: string | null;
  durationSec: number | null;

  // 播放状态
  playbackState: "playing" | "paused" | "stopped" | "unknown";

  // 时间锚点（用于前端本地推算）
  timeAnchor: {
    serverTimeMs: number;            // 服务端时间戳
    elapsedAtAnchorMs: number;       // 锚点时已播放毫秒
    isReliable: boolean;             // 是否来自可靠数据
  } | null;

  // 歌词
  lyricsMappingId: string | null;    // 用户手动选择的映射
  lyricsStatus: "none" | "loading" | "ready" | "error" | "manual";

  updatedAt: number;                 // 快照最后更新时间
}
```

## 规则

1. 浏览器首次连接 WebSocket 时，必须先收到当前车辆的 Snapshot。
2. 后续增量事件只在 generation 大于当前快照时才应用。
3. 切歌时必须生成新的 `trackInstanceId` 并递增 `generation`。
4. 暂停/恢复不改变 `trackInstanceId`，但会更新 `timeAnchor` 和 `playbackState`。
5. 用户手动选择歌词后，更新 `lyricsMappingId` 并递增 generation。

## 存储

- Redis：快照热数据（key: `snapshot:{vehicleId}`）
- 持久化可选（用于管理后台查询最近状态）
