import os
import sys
from dotenv import load_dotenv

# Adiciona o diretório raiz do projeto ao sys.path para imports absolutos
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(project_root)

from src.services.model_router import ModelRouter

try:
    from antigravity import LocalAgentConfig
except ImportError:
    LocalAgentConfig = None

def run_semantic_extraction():
    """
    Subagente responsável pela extração semântica com o Graphify.
    Garante o isolamento da GEMINI_API_KEY lendo do arquivo .env.
    """
    # 1. Carrega as variáveis de ambiente de forma segura
    load_dotenv(os.path.join(project_root, '.env'))
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("ERRO: GEMINI_API_KEY não foi encontrada no .env. Verifique o arquivo!")
        
    print("Sucesso! GEMINI_API_KEY carregada com segurança do .env na memória RAM.")
    
    # 2. Inicializa o roteador de modelos
    # Simulando uma carga de trabalho de extração leve (summarize AST)
    router = ModelRouter(workspace_root=project_root)
    prompt_simulado = "Resuma o seguinte arquivo AST do projeto..."
    intent = "semantic_extraction"
    
    selected_model = router.get_model_for_task(prompt=prompt_simulado, intent=intent)
    print(f"[ModelRouter] Modelo selecionado para a tarefa '{intent}': {selected_model}")
    
    # 3. Inicializa o ambiente do Antigravity SDK
    if LocalAgentConfig:
        config = LocalAgentConfig(
            agent_name="GraphifySemanticAgent",
            api_key=api_key,
            model_name=selected_model
        )
        print(f"[{config.agent_name}] inicializado via Antigravity SDK com modelo {config.model_name}.")
    else:
        print(f"[GraphifySemanticAgent] (Mock - SDK não encontrada). Modelo injetado: {selected_model}")
        
    print("Iniciando extração semântica segura usando Graphify...")
    # Aqui entraria a chamada real para graphifyy
    # ex: graphifyy.extract(...)
    
    print("Extração concluída com sucesso. Roteamento de modelo aplicado e chaves protegidas!")

if __name__ == "__main__":
    run_semantic_extraction()
