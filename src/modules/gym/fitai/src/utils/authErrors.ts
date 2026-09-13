export function translateAuthError(error: string): string {
  const errLower = error.toLowerCase();
  
  if (errLower.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (errLower.includes('user already registered')) {
    return 'Ya existe una cuenta con este correo.';
  }
  if (errLower.includes('email not confirmed')) {
    return 'Debes confirmar tu correo antes de iniciar sesión.';
  }
  if (errLower.includes('password should be at least')) {
    return 'La contraseña es demasiado corta.';
  }
  if (errLower.includes('email rate limit exceeded')) {
    return 'Demasiados intentos. Espera unos minutos.';
  }
  if (errLower.includes('for security purposes')) {
    return 'Por seguridad, espera unos segundos antes de intentar de nuevo.';
  }
  
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}
