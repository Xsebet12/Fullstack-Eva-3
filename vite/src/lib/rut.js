export function normalizeRut(s){
  return String(s||'').replace(/\D/g,'')
}

export function computeDv(rutDigits){
  const digits = normalizeRut(rutDigits)
  if(!digits) return ''
  let sum = 0
  let mul = 2
  for(let i=digits.length-1;i>=0;i--){
    sum += Number(digits[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const mod = 11 - (sum % 11)
  if(mod === 11) return '0'
  if(mod === 10) return 'K'
  return String(mod)
}

export function isValidRut(rut, dv){
  const r = normalizeRut(rut)
  const d = String(dv||'').trim().toUpperCase()
  if(!r || r.length < 8) return false
  if(!/^[0-9K]$/.test(d)) return false
  return computeDv(r) === d
}
