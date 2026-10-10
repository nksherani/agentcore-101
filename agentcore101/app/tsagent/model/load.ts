import { BedrockModel } from '@strands-agents/sdk/models/bedrock';

export function loadModel(): BedrockModel {
  return new BedrockModel({ modelId: 'global.amazon.nova-2-lite-v1:0' });
}
