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

    // Verify annotations are present
    const depsTool = response.result.tools.find(t => t.name === 'graphify_get_deps');
    expect(depsTool.annotations).toBeDefined();
    expect(depsTool.annotations.readOnlyHint).toBe(true);
    expect(depsTool.annotations.destructiveHint).toBe(false);
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

  test('MCP Server handles tool failures with isError and clean messages', () => {
    const request = {
      jsonrpc: '2.0',
      id: 99,
      method: 'tools/call',
      params: {
        name: 'synapse_shift_persona',
        arguments: { active_persona: 'INVALID_PERSONA' }
      }
    };
    const response = processRPCRequest(request);
    expect(response.result.isError).toBe(true);
    expect(response.result.content[0].text).toContain('Error: Invalid persona');

    // Test with response_format=json for backward compatibility
    const jsonErrRequest = {
      jsonrpc: '2.0',
      id: 100,
      method: 'tools/call',
      params: {
        name: 'synapse_shift_persona',
        arguments: { active_persona: 'INVALID_PERSONA', response_format: 'json' }
      }
    };
    const jsonErrResponse = processRPCRequest(jsonErrRequest);
    expect(jsonErrResponse.result.isError).toBe(true);
    const errData = JSON.parse(jsonErrResponse.result.content[0].text);
    expect(errData.success).toBe(false);
    expect(errData.error).toContain('Invalid persona');
  });

  test('MCP Server supports response_format for reports', () => {
    // 1. Scan secrets in JSON format
    const secretsReqJson = {
      jsonrpc: '2.0',
      id: 101,
      method: 'tools/call',
      params: {
        name: 'synapse_scan_secrets',
        arguments: { response_format: 'json' }
      }
    };
    const secretsResJson = processRPCRequest(secretsReqJson);
    const secretsData = JSON.parse(secretsResJson.result.content[0].text);
    expect(secretsData.clean).toBeDefined();

    // 2. Scan secrets in Markdown format (default)
    const secretsReqMd = {
      jsonrpc: '2.0',
      id: 102,
      method: 'tools/call',
      params: {
        name: 'synapse_scan_secrets',
        arguments: {}
      }
    };
    const secretsResMd = processRPCRequest(secretsReqMd);
    expect(secretsResMd.result.content[0].text).toContain('###');

    // 3. Health check in JSON format
    const healthReqJson = {
      jsonrpc: '2.0',
      id: 103,
      method: 'tools/call',
      params: {
        name: 'synapse_context_health_check',
        arguments: { response_format: 'json' }
      }
    };
    const healthResJson = processRPCRequest(healthReqJson);
    const healthData = JSON.parse(healthResJson.result.content[0].text);
    expect(healthData.healthy).toBeDefined();

    // 4. Health check in Markdown format (default)
    const healthReqMd = {
      jsonrpc: '2.0',
      id: 104,
      method: 'tools/call',
      params: {
        name: 'synapse_context_health_check',
        arguments: {}
      }
    };
    const healthResMd = processRPCRequest(healthReqMd);
    expect(healthResMd.result.content[0].text).toContain('###');
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
