/* Unidades no pátio (PRÉVIA: códigos e lista de demonstração).
   Cada unidade é uma máquina específica, com código no estilo do número de frota.
   Na versão final, a Zocar preenche modelo, ano, horímetro e procedência de cada uma.
   tipo:     'caminhoes' | 'maquinas'
   operacao: 'locacao' e/ou 'venda'
   foto:     img/patio/<foto>.jpg (grande) e <foto>-p.jpg (pátio); protocolo: perfil, 3:2 */

window.ZOCAR_PATIO = [
  { id: 'Z-021', tipo: 'caminhoes', nome: 'Caminhão fora de estrada', operacao: ['venda'], local: 'Castelo/ES', foto: 'z021', credito: 'Martin Cooper, CC BY 2.0' },
  { id: 'Z-044', tipo: 'caminhoes', nome: 'Caminhão fora de estrada', operacao: ['venda'], local: 'Rio de Janeiro/RJ', foto: 'z044', credito: 'Peabody Energy, CC BY 3.0' },
  { id: 'Z-018', tipo: 'caminhoes', nome: 'Caminhão fora de estrada', operacao: ['locacao'], local: 'Rio de Janeiro/RJ', foto: 'z018', credito: 'Acervo Zocar Rio' },
  { id: 'Z-033', tipo: 'maquinas', nome: 'Escavadeira hidráulica', operacao: ['locacao'], local: 'Castelo/ES', foto: 'z033', credito: 'Derek Harper, CC BY-SA 2.0' },
  { id: 'Z-037', tipo: 'maquinas', nome: 'Pá carregadeira', operacao: ['venda'], local: 'Rio de Janeiro/RJ', foto: 'z037', credito: 'Fletcher, CC BY 4.0' },
  { id: 'Z-041', tipo: 'maquinas', nome: 'Trator de esteira', operacao: ['locacao'], local: 'Castelo/ES', foto: 'z041', credito: 'Grendelkhan, CC BY-SA 4.0' },
  { id: 'Z-024', tipo: 'caminhoes', nome: 'Caminhão fora de estrada', operacao: ['locacao', 'venda'], local: 'Rio de Janeiro/RJ', foto: 'z024', credito: 'Roy Luck, CC BY 2.0' },
  { id: 'Z-030', tipo: 'caminhoes', nome: 'Caminhão basculante MAN', operacao: ['locacao', 'venda'], local: 'Rio de Janeiro/RJ', foto: 'z030', credito: 'ermell, CC BY-SA 4.0' }
];
