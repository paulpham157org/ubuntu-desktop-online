# 🖥️ Ubuntu Desktop Online

Virtual Ubuntu Desktop on Browser with [E2B.dev](https://e2b.dev) Infrastructure

## ✨ Features

- 🚀 **Quick Start**: Create E2B sandbox in seconds
- ⏱️ **Automatic Time Management**:
  - Default duration: **59 minutes** (Free Plan)
  - Extendable up to **23 hours 59 minutes** (Pro Plan)
- ⏸️ **Smart Auto-Pause**: Automatically pauses when time expires
- 🔔 **Warning Banner**: Displays 59-second countdown for user decision
- 🗑️ **Auto-Cleanup**: Automatically deletes sandbox if no response
- 🐍 **Python Terminal**: Execute Python code directly in sandbox
- 🎨 **Beautiful UI**: Modern interface with Tailwind CSS

## 🏗️ Architecture

```
ubuntu-desktop-online/
├── src/
│   ├── components/           # React components
│   │   ├── PauseBanner.tsx   # Pause warning banner
│   │   ├── SessionControls.tsx # Session controls
│   │   └── Terminal.tsx      # Python terminal
│   ├── services/
│   │   └── E2BSessionManager.ts # E2B session manager
│   ├── stores/
│   │   └── useSessionStore.ts # Zustand store
│   ├── types/
│   │   └── session.ts        # TypeScript types
│   ├── utils/
│   │   └── config.ts         # Configuration loader
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── .env.example             # Environment template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # Tailwind CSS config
├── vite.config.ts          # Vite config
└── README.md              # Documentation
```

## 📋 Requirements

- Node.js >= 18.0.0
- npm or yarn
- E2B API Key (register at [e2b.dev/dashboard](https://e2b.dev/dashboard))

## 🚀 Installation

### 1. Clone repository

```bash
git clone https://github.com/your-username/ubuntu-desktop-online.git
cd ubuntu-desktop-online
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` file and add your E2B API Key:

```env
# E2B API Key - Get yours at https://e2b.dev/dashboard
E2B_API_KEY=your_e2b_api_key_here

# Optional: Custom configuration
# VITE_DEFAULT_SESSION_DURATION_MINUTES=59
# VITE_MAX_SESSION_DURATION_MINUTES=1439
# VITE_PAUSE_WARNING_SECONDS=59
```

### 4. Run application

```bash
npm run dev
```

Access: `http://localhost:3000`

## 📖 Usage Guide

### Step 1: Start Sandbox

1. Enter desired session duration (default 59 minutes)
2. Click **"Start"** button
3. Wait for sandbox creation (usually 5-10 seconds)

### Step 2: Use Terminal

1. Write Python code in "Code" box
2. Click **"Run Code"** to execute
3. View results in "Output" box

### Step 3: Manage Session

- **Monitor time**: Progress bar displays remaining time
- **When time expires**:
  - Sandbox automatically pauses
  - Warning banner appears
  - You have **59 seconds** to decide:
    - ✅ **Continue**: Restart new session
    - 🛑 **Terminate**: Close sandbox immediately

### Step 4: Cleanup

- If no button pressed within 59 seconds, sandbox will be **permanently deleted**
- You can click **"Stop Sandbox"** anytime to terminate early

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `E2B_API_KEY` | API key from E2B.dev | **Required** |
| `VITE_DEFAULT_SESSION_DURATION_MINUTES` | Default session duration | `59` |
| `VITE_MAX_SESSION_DURATION_MINUTES` | Max duration (Pro Plan) | `1439` |
| `VITE_PAUSE_WARNING_SECONDS` | Warning timeout after pause | `59` |

### E2B Plans

| Plan | Max Duration | Price |
|------|--------------|-------|
| **Free** | 59 minutes | Free |
| **Pro** | 23 hours 59 minutes | [View pricing](https://e2b.dev/pricing) |

## 🎯 Session States

- **🟢 ACTIVE**: Sandbox is running
- **🔵 STARTING**: Starting sandbox
- **🟠 PAUSED**: Paused, waiting for user decision
- **🟡 RESUMING**: Resuming session
- **⚫ TERMINATING**: Closing sandbox
- **⚪ TERMINATED**: Closed
- **🔴 ERROR**: Error occurred

## 🏗️ Build Production

```bash
npm run build
```

Output will be generated in `dist/` directory

## 🧪 Technology Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Sandbox Platform**: E2B.dev Code Interpreter

## 📝 E2B Session Manager API

### Constructor

```typescript
const manager = new E2BSessionManager(config: SessionConfig)
```

### Methods

#### `startSession(durationMinutes?: number)`
Start sandbox with optional duration

```typescript
await manager.startSession(120); // 120 minutes
```

#### `continueSession()`
Continue working after pause

```typescript
await manager.continueSession();
```

#### `terminateSession(auto?: boolean)`
Permanently delete sandbox

```typescript
await manager.terminateSession();
```

#### `executeCode(code: string)`
Execute Python code

```typescript
const output = await manager.executeCode('print("Hello")');
```

#### `subscribe(listener: Function)`
Subscribe to state change notifications

```typescript
const unsubscribe = manager.subscribe((info: SessionInfo) => {
  console.log('Session state:', info.state);
});
```

## 🐛 Troubleshooting

### Error: "E2B_API_KEY is not set"

**Solution**:
1. Check if `.env` file exists
2. Ensure `E2B_API_KEY` has valid value
3. Restart dev server: `npm run dev`

### Error: "Failed to initialize sandbox"

**Solution**:
1. Verify API key is valid at [e2b.dev/dashboard](https://e2b.dev/dashboard)
2. Check internet connection
3. View console logs for detailed error

### Sandbox deleted too quickly

**Solution**:
- Adjust `VITE_PAUSE_WARNING_SECONDS` in `.env`
- Upgrade to Pro Plan for longer session duration

## 🤝 Contributing

All contributions are welcome! Please:

1. Fork repository
2. Create new branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

This project is released under the MIT License. See [LICENSE](LICENSE) file for details.

## 🔗 Links

- [E2B Documentation](https://e2b.dev/docs)
- [E2B Dashboard](https://e2b.dev/dashboard)
- [E2B Pricing](https://e2b.dev/pricing)

## 👨‍💻 Authors

Built with ❤️ by **Paul Pham 157** and **Claude**

---

⭐ If you find this project useful, please give it a star!
