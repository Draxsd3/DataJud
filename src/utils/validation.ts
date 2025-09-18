export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Validar dígitos verificadores
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  const checkDigit = (digits: string, weights: number[]): number => {
    const sum = digits
      .split('')
      .reduce((acc, digit, index) => acc + parseInt(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const firstDigit = checkDigit(cleanCNPJ.substring(0, 12), weights1);
  const secondDigit = checkDigit(cleanCNPJ.substring(0, 12) + firstDigit, weights2);
  
  return cleanCNPJ.endsWith(`${firstDigit}${secondDigit}`);
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Validar dígitos verificadores
  const checkDigit = (digits: string, weight: number): number => {
    const sum = digits
      .split('')
      .reduce((acc, digit, index) => acc + parseInt(digit) * (weight - index), 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const firstDigit = checkDigit(cleanCPF.substring(0, 9), 10);
  const secondDigit = checkDigit(cleanCPF.substring(0, 9) + firstDigit, 11);
  
  return cleanCPF.endsWith(`${firstDigit}${secondDigit}`);
};

export const formatCNPJ = (cnpj: string): string => {
  const clean = cnpj.replace(/[^\d]/g, '');
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatCPF = (cpf: string): string => {
  const clean = cpf.replace(/[^\d]/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const detectDocumentType = (document: string): 'CNPJ' | 'CPF' | 'INVALID' => {
  const clean = document.replace(/[^\d]/g, '');
  
  if (clean.length === 11 && validateCPF(clean)) {
    return 'CPF';
  }
  
  if (clean.length === 14 && validateCNPJ(clean)) {
    return 'CNPJ';
  }
  
  return 'INVALID';
};