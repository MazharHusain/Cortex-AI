const target = process.env.SERVICE_NAME || process.env.RAILWAY_SERVICE_NAME || 'gateway';

console.log(`Starting service: ${target}`);

switch (target) {
  case 'auth-service':
  case 'auth':
    await import('./services/auth/index.js');
    break;
  case 'chat-service':
  case 'chat':
    await import('./services/chat/index.js');
    break;
  case 'agent-service':
  case 'agent':
    await import('./services/agent/index.js');
    break;
  case 'gateway':
  default:
    await import('./gateway/index.js');
    break;
}
