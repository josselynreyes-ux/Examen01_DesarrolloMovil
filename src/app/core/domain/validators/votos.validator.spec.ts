import { describe, expect, it } from 'vitest';

import { validarVotos } from './votos.validator';

const datos = () => ({ votos: [{ organizacion_id: 'a', votos: 10 }, { organizacion_id: 'b', votos: 20 }], votos_nulos: 2, votos_blancos: 3, total_sufragantes: 35 });

describe('validarVotos', () => {
  it('acepta una suma correcta', () => expect(() => validarVotos(datos())).not.toThrow());
  it('rechaza una suma incorrecta', () => expect(() => validarVotos({ ...datos(), total_sufragantes: 36 })).toThrow());
  it('rechaza negativos', () => expect(() => validarVotos({ ...datos(), votos_nulos: -1 })).toThrow());
  it('rechaza decimales', () => expect(() => validarVotos({ ...datos(), votos_blancos: 1.5 })).toThrow());
  it('rechaza organizaciones duplicadas', () => expect(() => validarVotos({ ...datos(), votos: [{ organizacion_id: 'a', votos: 10 }, { organizacion_id: 'a', votos: 20 }] })).toThrow());
  it('rechaza una lista vacía', () => expect(() => validarVotos({ ...datos(), votos: [] })).toThrow());
  it('acepta un acta con cero votos', () => expect(() => validarVotos({ votos: [{ organizacion_id: 'a', votos: 0 }], votos_nulos: 0, votos_blancos: 0, total_sufragantes: 0 })).not.toThrow());
});
