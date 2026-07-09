const fs = require('fs');
const path = require('path');
const { processRPCRequest, TOOLS } = require('../bin/synapse-mcp-server');

describe('⚡ Synapse Engine V2 - MCP Server & Benchmark Test Suite', () => {
  const GRAPH_PATH = path.join(__dirname, '..', 'graphify-out', 'graph.json');

  test('MCP Server handles initialize RPC request', () => {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {}
    };
    const response = processRPCRequest(request);
    expect(response).toBeDefined();
    expect(response.id).toBe(1);
    expect(response.result.serverInfo.name).toBe('synapse-mcp-server');
  });

  test('MCP Server lists available tools (13 tools)', () => {
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };
    const response = processRPCRequest(request);
    expect(response.result.tools).toHaveLength(13);
    const toolNames = response.result.tools.map(t => t.name);
    expect(toolNames).toContain('graphify_get_deps');
    expect(toolNames).toContain('synapse_shift_persona');
    expect(toolNames).toContain('synapse_scan_secrets');
    expect(toolNames).toContain('synapse_search_skills');
    expect(toolNames).toContain('synapse_hardware_status');
    expect(toolNames).toContain('synapse_select_device');
  });

  test('MCP Server executes tools/call for synapse_shift_persona', () => {
    const request = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'synapse_shift_persona',
        arguments: { active_persona: 'ARCHITECT' }
      }
    };
    const response = processRPCRequest(request);
    expect(response.result.content[0].type).toBe('text');
    const data = JSON.parse(response.result.content[0].text);
    expect(data.success).toBe(true);
    expect(data.active_persona).toBe('ARCHITECT');
  });

  test('MCP Server executes tools/call for synapse_hardware_status and synapse_select_device', () => {
    const statusReq = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: { name: 'synapse_hardware_status', arguments: {} }
    };
    const statusRes = processRPCRequest(statusReq);
    const statusData = JSON.parse(statusRes.result.content[0].text);
    expect(statusData.selected_device).toBeDefined();

    const selectReq = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'synapse_select_device',
        arguments: { workloadType: 'mcp_ipc', payloadSizeKb: 10.0 }
      }
    };
    const selectRes = processRPCRequest(selectReq);
    const selectData = JSON.parse(selectRes.result.content[0].text);
    expect(selectData.selected_device).toBe('CPU');
  });

  test('🔥 EXPLICIT BENCHMARK: Native File Read vs MCP Stdio Tool Call', () => {
    let fullGraphText = '';
    if (fs.existsSync(GRAPH_PATH)) {
      fullGraphText = fs.readFileSync(GRAPH_PATH, 'utf8');
    } else {
      fullGraphText = JSON.stringify({
        nodes: Array.from({ length: 500 }, (_, i) => ({ id: `file_${i}.js`, name: `module_${i}` })),
        edges: Array.from({ length: 1000 }, (_, i) => ({ source: `file_${i % 500}.js`, target: `file_${(i + 1) % 500}.js` }))
      }, null, 2);
    }

    const nativeSizeBytes = Buffer.byteLength(fullGraphText, 'utf8');
    const nativeEstimatedTokens = Math.ceil(fullGraphText.length / 4);

    const mcpStartTime = process.hrtime.bigint();
    const request = {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'graphify_get_deps',
        arguments: { targetFile: 'synapse-cli.js' }
      }
    };
    const response = processRPCRequest(request);
    const mcpEndTime = process.hrtime.bigint();

    const mcpLatencyMs = Number(mcpEndTime - mcpStartTime) / 1e6;
    const mcpResponseText = JSON.stringify(response);
    const mcpSizeBytes = Buffer.byteLength(mcpResponseText, 'utf8');
    const mcpEstimatedTokens = Math.ceil(mcpResponseText.length / 4);

    const tokenReductionPct = (((nativeEstimatedTokens - mcpEstimatedTokens) / nativeEstimatedTokens) * 100).toFixed(2);
    const costFactorReduction = (nativeEstimatedTokens / Math.max(mcpEstimatedTokens, 1)).toFixed(1);

    console.log('\n================================================================================');
    console.log('📊 SYNAPSE ENGINE V2 - MCP BENCHMARK COMPARISON TABLE');
    console.log('================================================================================');
    console.table([
      {
        Abordagem: 'Leitura Direta (Context Dump)',
        Tamanho_Payload: `${(nativeSizeBytes / 1024).toFixed(2)} KB`,
        Tokens_Estimados: nativeEstimatedTokens,
        Latência_IPC: 'Depende de E/S de Arquivo',
        Eficiência: 'Baseline (0%)'
      },
      {
        Abordagem: 'Synapse Graphify MCP Server',
        Tamanho_Payload: `${(mcpSizeBytes / 1024).toFixed(2)} KB`,
        Tokens_Estimados: mcpEstimatedTokens,
        Latência_IPC: `${mcpLatencyMs.toFixed(3)} ms`,
        Eficiência: `${tokenReductionPct}% redução (${costFactorReduction}x mais econômico)`
      }
    ]);
    console.log('================================================================================\n');

    expect(mcpEstimatedTokens).toBeLessThan(nativeEstimatedTokens);
    expect(parseFloat(tokenReductionPct)).toBeGreaterThan(80.0);
  });
});
