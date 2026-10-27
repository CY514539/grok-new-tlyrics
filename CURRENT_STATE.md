# CURRENT_STATE.md

**最后更新**: 2026-10-27

## 当前阶段

**项目初始化** — 项目大脑文件已建立，仓库为空。

## 已完成

- [x] 确定干净重做策略
- [x] 建立项目大脑文件（ARCHITECTURE / DATA_MODEL / CURRENT_STATE 等）

## 正在进行

- 等待用户将基础文件推送到 GitHub 仓库

## 下一步（按优先级）

1. 用户将本目录文件推送到 https://github.com/CY514539/grok-new-tlyrics
2. 完善 `docs/MOCK_STRATEGY.md` 并实现一个最小 Mock 媒体事件发送工具
3. 定义 WebSocket 协议与 Canonical Snapshot 结构
4. 搭建前端播放器骨架（三行 KTV + 本地时钟推算）
5. 实现歌词匹配服务的接口契约（先 Mock）

## 已知问题 / 风险

- 无（刚启动）

## 回归检查清单（每次改动后过一遍）

- [ ] 切歌后正确显示新歌词，旧歌词不覆盖
- [ ] 暂停停止推进，恢复继续
- [ ] 页面刷新后恢复正确歌曲与进度
- [ ] 手动选择歌词版本后立即生效且长期记忆
- [ ] 免费额度不重复扣同一首歌
- [ ] WebSocket 重连后重新同步 Snapshot
