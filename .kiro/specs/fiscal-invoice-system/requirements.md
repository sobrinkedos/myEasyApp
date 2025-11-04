# Requirements Document - Sistema de Emissão de Notas Fiscais

## Introduction

Este documento especifica os requisitos para o Sistema de Emissão de Notas Fiscais, responsável por gerar NF-e (Nota Fiscal Eletrônica) e NFC-e (Nota Fiscal de Consumidor Eletrônica) em conformidade com a legislação brasileira e integração com SEFAZ.

## Glossary

- **NF-e**: Nota Fiscal Eletrônica para operações entre empresas
- **NFC-e**: Nota Fiscal de Consumidor Eletrônica para vendas ao consumidor final
- **SEFAZ**: Secretaria da Fazenda responsável por autorizar notas fiscais
- **DANFE**: Documento Auxiliar da Nota Fiscal Eletrônica (versão impressa)
- **Chave de Acesso**: Código de 44 dígitos que identifica unicamente uma nota fiscal
- **Sistema Fiscal**: Módulo que gerencia emissão e controle de notas fiscais
- **Certificado Digital**: Certificado A1 ou A3 usado para assinar notas fiscais
- **XML**: Formato de arquivo da nota fiscal eletrônica

## Requirements

### Requirement 1 - Configuração Fiscal

**User Story:** Como um administrador, eu quero configurar dados fiscais do estabelecimento, para que possa emitir notas fiscais.

#### Acceptance Criteria

1. QUANDO um administrador acessa configurações fiscais, O Sistema Fiscal DEVE exibir formulário com CNPJ, inscrição estadual e regime tributário
2. O Sistema Fiscal DEVE validar formato de CNPJ e inscrição estadual antes de salvar
3. O Sistema Fiscal DEVE permitir upload de certificado digital A1 (arquivo .pfx)
4. QUANDO certificado é carregado, O Sistema Fiscal DEVE validar senha e data de validade
5. O Sistema Fiscal DEVE alertar quando certificado estiver próximo do vencimento (30 dias)

### Requirement 2 - Emissão de NFC-e

**User Story:** Como um sistema, eu quero emitir NFC-e automaticamente ao finalizar venda, para que cliente receba nota fiscal.

#### Acceptance Criteria

1. QUANDO venda é finalizada e paga, O Sistema Fiscal DEVE gerar XML da NFC-e com dados do pedido
2. O Sistema Fiscal DEVE assinar XML usando certificado digital do estabelecimento
3. O Sistema Fiscal DEVE enviar XML assinado para SEFAZ e aguardar autorização
4. QUANDO SEFAZ autoriza nota, O Sistema Fiscal DEVE armazenar XML autorizado e chave de acesso
5. QUANDO SEFAZ rejeita nota, O Sistema Fiscal DEVE registrar motivo e permitir correção

### Requirement 3 - Geração de DANFE

**User Story:** Como um cliente, eu quero receber DANFE da minha compra, para que tenha comprovante fiscal.

#### Acceptance Criteria

1. QUANDO NFC-e é autorizada, O Sistema Fiscal DEVE gerar DANFE em formato PDF
2. O Sistema Fiscal DEVE incluir QR Code no DANFE para consulta online
3. O Sistema Fiscal DEVE incluir chave de acesso e dados do estabelecimento no DANFE
4. O Sistema Fiscal DEVE permitir enviar DANFE por email ao cliente
5. O Sistema Fiscal DEVE permitir imprimir DANFE em impressora térmica

### Requirement 4 - Consulta de Notas Fiscais

**User Story:** Como um administrador, eu quero consultar notas fiscais emitidas, para que possa acompanhar emissões.

#### Acceptance Criteria

1. QUANDO um administrador acessa notas fiscais, O Sistema Fiscal DEVE exibir lista paginada com número, data, valor e status
2. O Sistema Fiscal DEVE permitir filtrar por período, status e tipo (NF-e/NFC-e)
3. QUANDO administrador clica em nota, O Sistema Fiscal DEVE exibir detalhes completos
4. O Sistema Fiscal DEVE permitir download do XML e PDF da nota
5. O Sistema Fiscal DEVE exibir histórico de eventos da nota (emissão, autorização, cancelamento)

### Requirement 5 - Cancelamento de Nota Fiscal

**User Story:** Como um administrador, eu quero cancelar notas fiscais, para que possa corrigir erros.

#### Acceptance Criteria

1. QUANDO um administrador solicita cancelamento de nota autorizada, O Sistema Fiscal DEVE validar prazo de 24 horas
2. O Sistema Fiscal DEVE solicitar justificativa com mínimo de 15 caracteres
3. QUANDO cancelamento é confirmado, O Sistema Fiscal DEVE enviar evento de cancelamento ao SEFAZ
4. QUANDO SEFAZ processa cancelamento, O Sistema Fiscal DEVE atualizar status da nota para "cancelada"
5. O Sistema Fiscal DEVE registrar data/hora e usuário responsável pelo cancelamento

### Requirement 6 - Carta de Correção

**User Story:** Como um administrador, eu quero emitir carta de correção, para que possa corrigir erros sem cancelar nota.

#### Acceptance Criteria

1. QUANDO um administrador solicita carta de correção, O Sistema Fiscal DEVE validar que nota está autorizada
2. O Sistema Fiscal DEVE permitir informar correção com mínimo de 15 caracteres
3. O Sistema Fiscal DEVE validar que correção não altera valores ou destinatário
4. QUANDO carta é confirmada, O Sistema Fiscal DEVE enviar evento de CCe ao SEFAZ
5. O Sistema Fiscal DEVE permitir múltiplas cartas de correção para mesma nota (máximo 20)

### Requirement 7 - Inutilização de Numeração

**User Story:** Como um administrador, eu quero inutilizar números de nota, para que possa manter sequência correta.

#### Acceptance Criteria

1. QUANDO um administrador solicita inutilização, O Sistema Fiscal DEVE validar que números não foram utilizados
2. O Sistema Fiscal DEVE solicitar justificativa para inutilização
3. QUANDO inutilização é confirmada, O Sistema Fiscal DEVE enviar pedido ao SEFAZ
4. QUANDO SEFAZ processa inutilização, O Sistema Fiscal DEVE registrar números inutilizados
5. O Sistema Fiscal DEVE impedir uso de números inutilizados em futuras emissões

### Requirement 8 - Contingência Offline

**User Story:** Como um sistema, eu quero emitir notas em contingência, para que vendas não sejam interrompidas quando SEFAZ estiver indisponível.

#### Acceptance Criteria

1. QUANDO SEFAZ está indisponível, O Sistema Fiscal DEVE ativar modo de contingência automaticamente
2. O Sistema Fiscal DEVE emitir notas em contingência com numeração específica
3. O Sistema Fiscal DEVE armazenar notas de contingência localmente
4. QUANDO SEFAZ volta a funcionar, O Sistema Fiscal DEVE transmitir notas de contingência automaticamente
5. O Sistema Fiscal DEVE alertar usuário quando estiver em modo de contingência



### Requirement 9 - Tributação de Produtos

**User Story:** Como um administrador, eu quero configurar tributação de produtos, para que notas fiscais sejam emitidas corretamente.

#### Acceptance Criteria

1. QUANDO um administrador cadastra produto, O Sistema Fiscal DEVE permitir definir NCM, CFOP e CEST
2. O Sistema Fiscal DEVE permitir configurar alíquotas de ICMS, PIS e COFINS por produto
3. O Sistema Fiscal DEVE validar NCM com tabela oficial da Receita Federal
4. O Sistema Fiscal DEVE calcular impostos automaticamente ao gerar nota fiscal
5. O Sistema Fiscal DEVE permitir diferentes configurações tributárias por estado

### Requirement 10 - Manifestação do Destinatário

**User Story:** Como um administrador, eu quero manifestar ciência de notas recebidas, para que possa confirmar recebimento.

#### Acceptance Criteria

1. QUANDO estabelecimento recebe NF-e de fornecedor, O Sistema Fiscal DEVE permitir consultar nota
2. O Sistema Fiscal DEVE exibir opções de manifestação (ciência, confirmação, desconhecimento, não realizada)
3. QUANDO administrador confirma operação, O Sistema Fiscal DEVE enviar evento de manifestação ao SEFAZ
4. O Sistema Fiscal DEVE registrar data e tipo de manifestação
5. O Sistema Fiscal DEVE alertar sobre notas recebidas sem manifestação

### Requirement 11 - Relatórios Fiscais

**User Story:** Como um administrador, eu quero gerar relatórios fiscais, para que possa cumprir obrigações acessórias.

#### Acceptance Criteria

1. QUANDO um administrador solicita relatório de notas emitidas, O Sistema Fiscal DEVE gerar lista com totais por período
2. O Sistema Fiscal DEVE calcular total de impostos recolhidos (ICMS, PIS, COFINS)
3. O Sistema Fiscal DEVE gerar relatório de notas canceladas com justificativas
4. O Sistema Fiscal DEVE permitir exportar relatórios em formato Excel e PDF
5. O Sistema Fiscal DEVE gerar arquivo SPED Fiscal quando solicitado

### Requirement 12 - Integração com Pedidos

**User Story:** Como um sistema, eu quero vincular notas fiscais a pedidos, para que possa rastrear vendas.

#### Acceptance Criteria

1. QUANDO nota fiscal é emitida, O Sistema Fiscal DEVE vincular automaticamente ao pedido correspondente
2. O Sistema Fiscal DEVE exibir chave de acesso da nota nos detalhes do pedido
3. O Sistema Fiscal DEVE permitir reemitir nota a partir do pedido
4. QUANDO pedido é cancelado, O Sistema Fiscal DEVE alertar sobre necessidade de cancelar nota
5. O Sistema Fiscal DEVE validar que todos os itens do pedido estão na nota fiscal

### Requirement 13 - Validação de XML

**User Story:** Como um sistema, eu quero validar XML antes de enviar, para que evite rejeições do SEFAZ.

#### Acceptance Criteria

1. QUANDO XML é gerado, O Sistema Fiscal DEVE validar estrutura contra schema XSD oficial
2. O Sistema Fiscal DEVE validar regras de negócio (totais, alíquotas, datas)
3. O Sistema Fiscal DEVE validar assinatura digital do XML
4. QUANDO validação falha, O Sistema Fiscal DEVE exibir erros específicos para correção
5. O Sistema Fiscal DEVE permitir visualizar XML antes de enviar ao SEFAZ

### Requirement 14 - Backup de Notas Fiscais

**User Story:** Como um administrador, eu quero backup automático de notas, para que possa recuperar em caso de perda.

#### Acceptance Criteria

1. O Sistema Fiscal DEVE fazer backup diário de todos os XMLs autorizados
2. O Sistema Fiscal DEVE armazenar backups em local seguro separado do servidor principal
3. O Sistema Fiscal DEVE manter backups por período mínimo de 5 anos
4. O Sistema Fiscal DEVE permitir restaurar notas a partir do backup
5. O Sistema Fiscal DEVE validar integridade dos backups mensalmente

### Requirement 15 - Consulta de Status SEFAZ

**User Story:** Como um administrador, eu quero consultar status do SEFAZ, para que saiba se posso emitir notas.

#### Acceptance Criteria

1. O Sistema Fiscal DEVE exibir indicador de status do SEFAZ no dashboard
2. O Sistema Fiscal DEVE consultar status do SEFAZ a cada 5 minutos
3. QUANDO SEFAZ está indisponível, O Sistema Fiscal DEVE exibir alerta vermelho
4. O Sistema Fiscal DEVE registrar histórico de disponibilidade do SEFAZ
5. O Sistema Fiscal DEVE permitir consulta manual de status

### Requirement 16 - Numeração de Notas

**User Story:** Como um sistema, eu quero controlar numeração de notas, para que mantenha sequência correta.

#### Acceptance Criteria

1. O Sistema Fiscal DEVE manter contador separado para NF-e e NFC-e
2. O Sistema Fiscal DEVE incrementar numeração automaticamente a cada emissão
3. O Sistema Fiscal DEVE validar que número não foi utilizado antes de emitir
4. O Sistema Fiscal DEVE permitir configurar número inicial da série
5. O Sistema Fiscal DEVE bloquear emissão se houver gap na numeração

### Requirement 17 - Logs de Auditoria

**User Story:** Como um administrador, eu quero logs de todas as operações fiscais, para que possa auditar ações.

#### Acceptance Criteria

1. O Sistema Fiscal DEVE registrar log de cada emissão com usuário, data/hora e resultado
2. O Sistema Fiscal DEVE registrar tentativas de cancelamento e inutilização
3. O Sistema Fiscal DEVE registrar acessos a XMLs e relatórios fiscais
4. O Sistema Fiscal DEVE manter logs por período mínimo de 5 anos
5. O Sistema Fiscal DEVE permitir exportar logs para análise externa

### Requirement 18 - Performance e Confiabilidade

**User Story:** Como um sistema, eu quero processar emissões rapidamente, para que não atrase vendas.

#### Acceptance Criteria

1. O Sistema Fiscal DEVE gerar e assinar XML em tempo máximo de 3 segundos
2. O Sistema Fiscal DEVE processar resposta do SEFAZ em tempo máximo de 10 segundos
3. O Sistema Fiscal DEVE implementar fila para processar emissões em lote
4. O Sistema Fiscal DEVE retentar envio automaticamente em caso de timeout
5. O Sistema Fiscal DEVE suportar mínimo de 50 emissões simultâneas

### Requirement 19 - Segurança de Certificados

**User Story:** Como um administrador, eu quero que certificados digitais sejam protegidos, para que não sejam comprometidos.

#### Acceptance Criteria

1. O Sistema Fiscal DEVE armazenar certificado digital criptografado no banco de dados
2. O Sistema Fiscal DEVE solicitar senha do certificado apenas durante configuração
3. O Sistema Fiscal DEVE não exibir senha do certificado em logs ou interface
4. O Sistema Fiscal DEVE limitar tentativas de uso de certificado inválido
5. O Sistema Fiscal DEVE alertar sobre acesso não autorizado a certificados

### Requirement 20 - Conformidade Legal

**User Story:** Como um administrador, eu quero que sistema esteja conforme legislação, para que evite problemas fiscais.

#### Acceptance Criteria

1. O Sistema Fiscal DEVE seguir layout oficial da NF-e versão 4.0
2. O Sistema Fiscal DEVE implementar todas as validações obrigatórias do SEFAZ
3. O Sistema Fiscal DEVE manter histórico de alterações na legislação
4. O Sistema Fiscal DEVE atualizar automaticamente tabelas oficiais (NCM, CFOP)
5. O Sistema Fiscal DEVE exibir avisos sobre mudanças na legislação que afetam o estabelecimento
