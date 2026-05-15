# Relatório de Revisão de Código — Maratona ENEM 2026
Data: 14 de maio de 2026

## Resumo
- Total de arquivos revisados: 20
- Total de problemas encontrados: 9
- Total de problemas corrigidos: 9
- Build final: ✅ limpo (0 erros, 0 warnings)

---

## Correções por Arquivo

### src/utils/storage.js
- **[Bug Crítico]** `recordCorrectAnswer()` — streak count nunca incrementava. O campo `lastDate` é atualizado a cada resposta correta, então quando o usuário chegava à 5ª resposta do dia, `s.lastDate` já era `today` e o check `s.lastDate === YESTERDAY()` nunca disparava. Corrigido introduzindo `lastStreakDate` — campo separado que rastreia apenas quando o streak foi de fato incrementado, desvinculando o controle do streak da data da última resposta. Implementada compatibilidade retroativa: se `lastStreakDate` não existir nos dados salvos, usa `lastDate` como fallback.
- **[Bug]** `checkAndResetStreak()` — usava `lastDate` (data da última resposta) para decidir se o streak expirou, em vez de `lastStreakDate` (data do último streak completo). Corrigido para usar `lastStreakDate` com mesmo fallback retroativo.

### src/data/questoes.js
- **[Bug Crítico — Lógica/Matemática]** Questão `fis-4` (Eletricidade): os resistores `6 Ω, 6 Ω e 3 Ω` em paralelo resultam em `Rp = 1,5 Ω`, e com o resistor série de `2 Ω` a corrente seria `12 / 3,5 ≈ 3,43 A` — não fecha com nenhuma alternativa exata. A própria explicação original evidenciava a inconsistência (havia texto de rascunho visível). Corrigido para três resistores de `6 Ω cada`, que dão `Rp = 2 Ω → Rtotal = 4 Ω → I = 3 A` (gabarito B). Explicação reescrita com cálculo limpo.

### src/screens/Redacao.jsx
- **[Bug — Typo]** `pontosFortres` → `pontosFortes` em dois lugares: no `SYSTEM_PROMPT` (instrução enviada à API da Anthropic) e no componente `ResultadoView` (leitura da resposta). Como ambos usavam o mesmo typo, o app funcionava, mas o campo tem nome incorreto no JSON. Corrigido em todas as ocorrências com `replace_all`.
- **[Bug — Lógica]** Validação inconsistente: o botão "Analisar" era desativado em `wordCount < 50` palavras, mas a validação no `analisar()` checava `texto.trim().length < 100` (100 **caracteres**, não palavras), e a mensagem de erro dizia "100 **palavras**". Três valores diferentes para o mesmo threshold. Corrigido: botão desativa em `wordCount < 100`, validação checa `wordCount < 100`, mensagem já estava correta ("100 palavras").

### src/screens/Home.jsx
- **[Bug — Lógica]** `StatCard` de "Meta diária" usava `10` hardcoded tanto no valor exibido (`/10`) quanto no `Math.min`, ignorando a meta configurada pelo usuário em Configurações. Corrigido para usar `dailyGoal` lido via `getDailyGoal()` e mantido em estado local sincronizado no `useEffect`.

### src/App.jsx
- **[Qualidade]** Estado `nextScreen` declarado mas nunca lido no render — apenas escrito. O `navigate()` usa a variável da closure (`newScreen`) diretamente. Estado morto removido.
- **[Bug — CSS]** Classe `duration-180` não existe no Tailwind padrão (as durações pré-definidas são 75, 100, 150, 200, 300…). No modo JIT sem configuração extra, a classe é ignorada, desativando efetivamente a transição de fade. Corrigido para `duration-200`.

### Criação de arquivo
- **[Ausente]** `.env.example` não existia. Criado com a variável `VITE_ANTHROPIC_API_KEY` documentada para facilitar setup do projeto por novos colaboradores.

---

## Checklist de Consistência Global

| Item | Status |
|------|--------|
| Sistema de pontos consistente (fácil=5, médio=10, difícil=20, redação=50) | ✅ |
| Chaves do `localStorage` consistentes entre arquivos | ✅ |
| Props de componentes batem com o que os pais passam | ✅ |
| Todas as screens registradas no `SCREENS` do App.jsx | ✅ |
| Data do ENEM (08/11/2026) correta e igual em todos os lugares | ✅ |
| Modelo da API (`claude-sonnet-4-6`) correto | ✅ |
| Todos os imports de ícones Lucide existem no pacote | ✅ |
| Questões existem para todas as 12 matérias | ✅ |
| `.env.example` com `VITE_ANTHROPIC_API_KEY` | ✅ (criado nesta revisão) |
| API key lida de `import.meta.env` (nunca hardcoded) | ✅ |
| `JSON.parse` do localStorage envolto em try/catch | ✅ |

---

## Problemas que requerem atenção manual

- **Resumos teóricos ausentes**: A `ContentView` em `Materias.jsx` exibe um placeholder "Conteúdo em breve". Os arquivos de conteúdo precisam ser criados manualmente em `/conteudos/<materia>/`.
- **Questões por tópico**: Cada matéria tem apenas 1 questão por tópico. Alguns tópicos não têm questão correspondente (ex: "Álgebra" em matemática tem `id: mat-4` com tópico "Álgebra", mas ao filtrar por esse tópico aparece apenas 1 questão). Isso é esperado para a versão inicial, mas deve ser expandido.
- **API key exposta no browser**: A chamada à API da Anthropic é feita diretamente do frontend com `anthropic-dangerous-direct-browser-access: true`. Em produção, considere criar um backend intermediário (BFF) para nunca expor a chave no cliente.
- **Ranking com usuários simulados**: O `Torneio.jsx` usa `FAKE_USERS` hardcoded. Em uma versão real, isso precisaria de um backend com ranking real.

## Recomendações futuras

- Adicionar mais questões por tópico (pelo menos 3-5 por tópico para experiência de estudo real).
- Considerar `useReducer` para o estado de streak/pontos no `Home.jsx`, que concentra múltiplos `useState` relacionados.
- Adicionar `aria-label` nos botões de avatar no `Configuracoes.jsx` (acessibilidade).
- Considerar PWA offline: o `service worker` não está configurado, então o app não funciona sem internet.
