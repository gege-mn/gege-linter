import { describe, expect, it } from 'vitest';
import { lint, wrongBlock } from '../src/index.js';

describe('wrong-block', () => {
  it('flags the Ali Gali look-alike and offers the Hudum fix', () => {
    const ds = lint('ᢈᠣᠲᠠ', [wrongBlock]);
    expect(ds).toMatchObject([{ start: 0, severity: 'warning', fix: 'ᠬ' }]);
    expect(ds[0]?.message).toContain('Ali Gali');
  });

  it('names the sub-block for Todo / Sibe / Manchu letters, without a fix', () => {
    expect(lint('ᡆ', [wrongBlock])[0]?.message).toContain('Todo');
    expect(lint('ᡠ', [wrongBlock])[0]?.message).toContain('Sibe');
    const manchu = lint('ᡴ', [wrongBlock]);
    expect(manchu[0]?.message).toContain('Manchu');
    expect(manchu[0]?.fix).toBeUndefined();
  });

  it('accepts pure Hudum text (incl. U+1878)', () => {
    expect(lint('ᠬᠣᠲᠠ ᡸ', [wrongBlock])).toHaveLength(0);
  });
});
