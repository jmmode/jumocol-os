import { bootstrapAdmin, db } from '../src/server/auth/store.ts';
import { hiddenPassword } from './hidden-input.mjs';

try {
  const mode = process.argv[2];
  if (mode === 'prepare') { db(); console.log('Usuarios preparados sin contraseñas nuevas: julian (ADMIN), jorge y heidi (OPERADOR).'); }
  else if (mode === 'bootstrap' || mode === 'recover') {
    const password = await hiddenPassword('Contraseña de Julián (14–128 caracteres, entrada oculta): ');
    const repeat = await hiddenPassword('Repita la contraseña: ');
    if (password !== repeat) throw new Error('Las contraseñas no coinciden.');
    await bootstrapAdmin(password, mode === 'recover');
    console.log('Administrador activado. Credenciales no registradas en logs.');
  } else throw new Error('Uso: node scripts/identity-admin.mjs prepare|bootstrap|recover');
} catch (error) { console.error(error.message); process.exitCode = 1; }
