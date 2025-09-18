import { TribunalInfo } from '../types';

export const TRIBUNAIS: TribunalInfo[] = [
  { alias: 'trf1', nome: 'Tribunal Regional Federal da 1ª Região', url: 'trf1' },
  { alias: 'trf2', nome: 'Tribunal Regional Federal da 2ª Região', url: 'trf2' },
  { alias: 'trf3', nome: 'Tribunal Regional Federal da 3ª Região', url: 'trf3' },
  { alias: 'trf4', nome: 'Tribunal Regional Federal da 4ª Região', url: 'trf4' },
  { alias: 'trf5', nome: 'Tribunal Regional Federal da 5ª Região', url: 'trf5' },
  { alias: 'trf6', nome: 'Tribunal Regional Federal da 6ª Região', url: 'trf6' },
  { alias: 'stj', nome: 'Superior Tribunal de Justiça', url: 'stj' },
  { alias: 'stf', nome: 'Supremo Tribunal Federal', url: 'stf' },
  { alias: 'tst', nome: 'Tribunal Superior do Trabalho', url: 'tst' },
  { alias: 'tse', nome: 'Tribunal Superior Eleitoral', url: 'tse' },
];

export const getTribunalByAlias = (alias: string): TribunalInfo | undefined => {
  return TRIBUNAIS.find(t => t.alias === alias);
};

export const getAllTribunais = (): TribunalInfo[] => {
  return TRIBUNAIS;
};