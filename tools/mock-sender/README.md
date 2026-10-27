# Mock Sender

最小 Mock 媒体事件发送工具。

## 用法

```bash
cd tools/mock-sender
python3 send.py song_start --title "七里香" --artist "周杰伦" --duration 270
python3 send.py pause
python3 send.py resume
python3 send.py song_change --title "夜曲" --artist "Jay Chou" --duration 226
```

当前仅打印事件 JSON到标准输出，后续可接入本地 Receiver 端点。
