# Adding New Agents to AgentCore

This guide explains how to add new agents to an existing AgentCore project, with practical examples across languages and frameworks.

---

## Overview

In an AgentCore project:
- Each agent lives in its own directory under `app/<agent-name>/`.
- Each agent is configured as an entry under `runtimes` in [agentcore.json](file:///Volumes/Lexar/GitHub/agentcore-101/agentcore101/agentcore/agentcore.json).
- Each agent gets its own independent runtime and ARN upon deployment.
- Multiple agents can use different languages (Python, TypeScript), different frameworks (Strands, LangGraph, etc.), and different models.

---

## Command Syntax

```bash
agentcore add agent [options]
```

### Essential Flags for `--type create` (default)

| Flag | Options / Format | Note |
|---|---|---|
| `--name <name>` | Alphanumeric + underscores | Name of your agent runtime |
| `--language <lang>` | `Python`, `TypeScript` | Target programming language |
| `--framework <fw>` | `Strands`, `LangChain_LangGraph`, `GoogleADK`, `OpenAIAgents`, `VercelAI`, `BedrockManagedAgents` | Agent framework SDK |
| `--model-provider <prov>` | `Bedrock`, `Anthropic`, `OpenAI`, `Gemini` | Model provider |
| `--memory <mem>` | `none`, `shortTerm`, `longAndShortTerm` | **Required** flag for create path |
| `--build <type>` | `CodeZip`, `Container` | Default: `CodeZip` |
| `--protocol <prot>` | `HTTP`, `MCP`, `A2A`, `AGUI` | Default: `HTTP` |

> [!IMPORTANT]
> `--memory` is **mandatory** when using `agentcore add agent`. If omitted, the command will fail with `--memory is required for create path`.

---

## Examples

### 1. Interactive Mode (Easiest)
Run inside the project root (`agentcore101/`):
```bash
agentcore add agent
```
The CLI will prompt you interactively to choose:
1. Agent name
2. Language (Python / TypeScript)
3. Framework
4. Model provider
5. Memory configuration

---

### 2. Add a TypeScript Agent (Strands + Bedrock)

```bash
cd agentcore101
agentcore add agent \
  --name tsagent \
  --language TypeScript \
  --framework Strands \
  --model-provider Bedrock \
  --memory none \
  --build CodeZip
```

**Files created:**
- `app/tsagent/main.ts` — Starlette/HTTP ASGI entrypoint
- `app/tsagent/model/load.ts` — Model definition
- `app/tsagent/package.json` — TypeScript dependencies

---

### 3. Add a Python LangGraph Agent

```bash
cd agentcore101
agentcore add agent \
  --name graph_agent \
  --language Python \
  --framework LangChain_LangGraph \
  --model-provider Bedrock \
  --memory none \
  --build CodeZip
```

---

### 4. Add a Python Agent with Short-Term Memory

```bash
cd agentcore101
agentcore add agent \
  --name memory_agent \
  --language Python \
  --framework Strands \
  --model-provider Bedrock \
  --memory shortTerm \
  --build CodeZip
```

---

## Post-Creation Steps

### Step 1: Verify / Update the Model
By default, Bedrock templates may specify Claude (`global.anthropic.claude-sonnet-4-5-20250929-v1:0`). If your AWS account lacks Marketplace subscriptions for Anthropic, switch the model to Amazon Nova Lite:

- **For Python** (`app/<agent-name>/model/load.py`):
  ```python
  from strands.models.bedrock import BedrockModel

  def load_model() -> BedrockModel:
      return BedrockModel(model_id="global.amazon.nova-2-lite-v1:0")
  ```

- **For TypeScript** (`app/<agent-name>/model/load.ts`):
  ```typescript
  import { BedrockModel } from '@strands-agents/sdk/models/bedrock';

  export function loadModel(): BedrockModel {
    return new BedrockModel({ modelId: 'global.amazon.nova-2-lite-v1:0' });
  }
  ```

---

### Step 2: Test Locally with Dev UI

1. Stop any currently running `agentcore dev` session (`Ctrl+C`).
2. Restart `agentcore dev`:
   ```bash
   agentcore dev
   ```
3. Open `http://localhost:8081` in your browser. You can select and chat with any of your configured agents.

---

### Step 3: Deploy to AWS

Deploy all configured agents:
```bash
agentcore deploy -y
```

### Step 4: Invoke Specific Agents

Check status of all deployed agents:
```bash
agentcore status
```

Invoke an agent:
```bash
# Invoke default agent (or specify agent runtime)
agentcore invoke --agent myagent "Hello"
agentcore invoke --agent tsagent "Hello from TypeScript"
```
*(Check `agentcore invoke --help` for specific agent routing options)*
