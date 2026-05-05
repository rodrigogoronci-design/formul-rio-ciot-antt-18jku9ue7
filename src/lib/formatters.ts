export const formatCpfCnpj = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 14)
  if (v.length <= 11) {
    return v
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3-')
      .replace(/(\d{3})(\d{3})/, '$1.$2.')
      .replace(/(\d{3})/, '$1.')
  }
  return v
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4-')
    .replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3/')
    .replace(/(\d{2})(\d{3})/, '$1.$2.')
    .replace(/(\d{2})/, '$1.')
}

export const formatPlaca = (value: string) => {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 7)
}

export const formatCurrency = (value: string) => {
  let v = value.replace(/\D/g, '')
  if (!v) return ''
  v = (parseInt(v, 10) / 100).toFixed(2)
  return 'R$ ' + v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export const formatCEP = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 8)
  return v.length > 5 ? v.replace(/^(\d{5})(\d)/, '$1-$2') : v
}

export const formatNumberOnly = (value: string, maxLen: number = 9) => {
  return value.replace(/\D/g, '').slice(0, maxLen)
}
