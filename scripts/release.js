#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Função para logar mensagens formatadas em português
function log(msg) {
  console.log(`[RELEASE] ${msg}`);
}

function errorLog(msg) {
  console.error(`[RELEASE ERROR] ❌ ${msg}`);
}

// 1. Carregar variáveis do arquivo .env
const envPath = path.resolve(process.cwd(), '.env');
let githubPat = process.env.GITHUB_PAT || process.env.GH_TOKEN;

if (fs.existsSync(envPath)) {
  log('Carregando configurações do arquivo .env local...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GITHUB_PAT=["']?([^"'\r\n]+)["']?/);
  if (match) {
    githubPat = match[1];
  }
}

if (!githubPat) {
  errorLog('GITHUB_PAT não configurado no ambiente nem no arquivo .env.');
  process.exit(1);
}

// 2. Obter a versão atual do package.json
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  errorLog('package.json não encontrado na raiz do projeto.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;
log(`Versão detectada para release: v${version}`);

// 3. Extrair notas da versão do CHANGELOG.md
const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
let releaseBody = `Release oficial da versão v${version} do Synapse Engine.`;

if (fs.existsSync(changelogPath)) {
  log('Extraindo notas da versão do CHANGELOG.md...');
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const versionEscaped = version.replace(/\./g, '\\.');
  const regex = new RegExp(`##\\s*\\[?${versionEscaped}\\]?(?:[\\s\\S]*?)(?=\\n##|$)`);
  const match = changelog.match(regex);
  if (match) {
    // Remove o cabeçalho '## [X.Y.Z]' para pegar apenas as descrições
    releaseBody = match[0].replace(/##\s*\[?[\d\.]+\]?.*?\n/, '').trim();
    log('Notas de versão extraídas com sucesso.');
  } else {
    log(`Aviso: Notas da versão v${version} não encontradas no CHANGELOG.md. Usando descrição padrão.`);
  }
} else {
  log('Aviso: CHANGELOG.md não encontrado na raiz. Usando descrição padrão.');
}

// 4. Executar os testes Jest para garantir integridade
try {
  log('Rodando suíte de testes unitários para verificação de portão de qualidade...');
  execSync('npm test', { stdio: 'inherit' });
  log('Testes passaram com sucesso.');
} catch (e) {
  errorLog('A suíte de testes falhou. Abortando release para proteção da integridade.');
  process.exit(1);
}

// 5. Garantir que tudo está comitado localmente
try {
  log('Verificando status de arquivos modificados no Git...');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (gitStatus) {
    log('Detectadas alterações não salvas. Criando commit automático de release...');
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "chore(release): prepare release v${version}"`, { stdio: 'inherit' });
    log('Commit de preparação de release criado.');
  } else {
    log('Repositório limpo, nenhum commit residual necessário.');
  }
} catch (e) {
  errorLog(`Falha ao preparar commit no Git: ${e.message}`);
  process.exit(1);
}

// 6. Verificar se a tag já existe localmente ou remotamente
const tag = `v${version}`;
try {
  log(`Verificando se a tag ${tag} já existe localmente...`);
  const localTags = execSync('git tag', { encoding: 'utf8' });
  if (localTags.split('\n').includes(tag)) {
    log(`A tag ${tag} já existe localmente. Removendo tag local antiga...`);
    execSync(`git tag -d ${tag}`, { stdio: 'inherit' });
  }
} catch (e) {
  errorLog(`Falha ao inspecionar tags do Git: ${e.message}`);
}

// 7. Criar tag localmente
try {
  log(`Criando tag local ${tag}...`);
  execSync(`git tag -a ${tag} -m "Release ${tag}"`, { stdio: 'inherit' });
  log(`Tag ${tag} criada localmente.`);
} catch (e) {
  errorLog(`Falha ao criar tag Git local: ${e.message}`);
  process.exit(1);
}

// 8. Enviar commits e tag para o GitHub
try {
  log('Enviando ramificação master para origin remoto...');
  execSync('git push origin master', { stdio: 'inherit' });
  log(`Enviando tag ${tag} para origin remoto...`);
  execSync(`git push origin ${tag} --force`, { stdio: 'inherit' });
  log('Git push efetuado com sucesso.');
} catch (e) {
  errorLog(`Falha ao fazer push no Git origin: ${e.message}`);
  process.exit(1);
}

// 9. Criar a Release no GitHub via REST API usando https nativo
log('Iniciando chamada HTTP para criação da Release oficial no GitHub...');
const repoOwner = 'LuGuBo';
const repoName = 'Synapse-Engine';

const postData = JSON.stringify({
  tag_name: tag,
  target_commitish: 'master',
  name: `v${version} - Core Refactoring & Skill Decoupling`,
  body: releaseBody,
  draft: false,
  prerelease: false
});

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: `/repos/${repoOwner}/${repoName}/releases`,
  method: 'POST',
  headers: {
    'Authorization': `token ${githubPat}`,
    'User-Agent': 'Synapse-Engine-Release-Agent',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Accept': 'application/vnd.github+json'
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201) {
      const releaseInfo = JSON.parse(responseData);
      log(`🎉 Release oficial criada com sucesso no GitHub!`);
      log(`🔗 URL da Release: ${releaseInfo.html_url}`);
      process.exit(0);
    } else {
      errorLog(`Falha ao criar release no GitHub. Código de Status: ${res.statusCode}`);
      errorLog(`Resposta da API: ${responseData}`);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  errorLog(`Erro na requisição da API do GitHub: ${e.message}`);
  process.exit(1);
});

// Envia os dados no corpo da requisição
req.write(postData);
req.end();
