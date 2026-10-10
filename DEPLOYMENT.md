# How This Agent Was Deployed

## Environment
- AgentCore CLI 0.31.1, Node v22, Python 3.13
- AWS CLI authenticated as `naveed-admin`, account `539148045575`, region `us-east-1`

## Steps

1. **Verify tooling and credentials**
   ```bash
   agentcore --version
   aws sts get-caller-identity
   aws configure get region
   ```

2. **Create the project** (non-interactive)
   ```bash
   agentcore create \
     --project-name agentcore101 \
     --name myagent \
     --framework Strands \
     --model-provider Bedrock \
     --memory none \
     --build CodeZip \
     --language Python \
     --skip-git \
     --output-dir /Volumes/Lexar/GitHub/agentcore-101
   ```
   This generated:
   - `agentcore101/app/myagent/` - Python Strands agent code
   - `agentcore101/agentcore/` - project config (`agentcore.json`, `aws-targets.json`) and the CDK project

3. **Deploy** (from inside the project directory)
   ```bash
   cd agentcore101
   agentcore deploy -y
   ```
   The CLI packages the agent as a zip and deploys a CDK/CloudFormation stack. It also enables transaction search for observability and persists the deployment state.

## Result
| Item | Value |
|---|---|
| Stack | `AgentCore-agentcore101-default` |
| Runtime ID | `agentcore101_myagent-QUPeURG0GW` |
| Runtime ARN | `arn:aws:bedrock-agentcore:us-east-1:539148045575:runtime/agentcore101_myagent-QUPeURG0GW` |
| Status | Deployed, runtime `READY` |

## Verify and use
Run these from `agentcore101/`. Running them from the parent directory fails with "No agentcore project found".
```bash
agentcore status
agentcore invoke "Hello"
```

Traces take about 10 minutes to appear after the first deploy. They show up in CloudWatch → GenAI Observability.

## Redeploy after changes
Edit the code in `app/myagent/`, then run `agentcore deploy -y` again.

## Switching the model to Amazon Nova 2 Lite

The default model was Claude Sonnet 4.5. It was changed with a one-line edit in
`app/myagent/model/load.py`. Strands' `BedrockModel` uses the Converse API, so nothing else changes.

```python
return BedrockModel(model_id="global.amazon.nova-2-lite-v1:0")
```

Notes:
- Nova 2 Lite supports **inference profiles only**. Use `global.amazon.nova-2-lite-v1:0`, or
  `us.amazon.nova-2-lite-v1:0` to keep traffic in the US. The bare ID `amazon.nova-2-lite-v1:0` fails.
- Redeploy and test:
  ```bash
  agentcore deploy -y
  agentcore invoke "Hello, who are you?"
  ```
- Before the redeploy, invoking the agent returned an `AccessDeniedException` about
  `aws-marketplace:ViewSubscriptions` / `aws-marketplace:Subscribe`. That came from the old Claude
  deployment, whose runtime role lacks Marketplace permissions. After the redeploy the agent replied normally.
