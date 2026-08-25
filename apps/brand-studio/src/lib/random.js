/**
 * Marca aleatória — uma marca inteira sorteada de uma vez.
 *
 * O ponto não é sortear cada token de forma independente: um `font-size.md`
 * solto entre 0,5rem e 4rem não produz uma marca, produz lixo. O que se sorteia
 * aqui são os **parâmetros** de que cada escala nasce — um matiz, uma razão
 * modular, um raio base, um jogo de colunas — e as escalas são então derivadas
 * deles com as mesmas regras que a marca de referência usa. O resultado é
 * sempre inesperado e sempre coerente: a tipografia continua sendo uma
 * progressão geométrica, os breakpoints continuam crescentes, o gutter continua
 * cabendo dentro da margem.
 *
 * Os limites de cada sorteio são os mesmos declarados em `schema.js` para a
 * edição manual, então nada que sai daqui é um valor que o usuário não pudesse
 * ter digitado.
 */

import { buildClamp } from './clamp.js';
import { generateRamp, hexToTokenValue, hslToHex } from './color.js';
import { FAMILIES, FONT_STACKS, STEPS, THEMES } from './schema.js';

const random = (min, max) => min + Math.random() * (max - min);
const randomInt = (min, max) => Math.floor(random(min, max + 1));
const pick = (list) => list[randomInt(0, list.length - 1)];
const roundTo = (value, step) => Math.round(value / step) * step;

/* ── Cor ──────────────────────────────────────────────────────── */

/**
 * As duas famílias saem de um único matiz sorteado. `secondary` recebe um
 * desvio de matiz mas a curva de saturação dela já ancora num nível quase
 * neutro, então continua servindo de superfície e texto em vez de competir com
 * a primária. As duas rampas vêm de `generateRamp`, isto é, das mesmas curvas de
 * luminosidade da marca de referência — é isso que preserva o ritmo de
 * contraste entre os degraus, e com ele a legibilidade.
 */
function randomColors() {
  const hue = random(0, 360);
  const saturation = random(0.55, 0.95);
  const base = {
    primary: hslToHex({ h: hue, s: saturation, l: 0.5 }),
    secondary: hslToHex({
      h: (hue + pick([-40, -25, 0, 25, 40, 180])) % 360,
      s: saturation,
      l: 0.5,
    }),
  };

  return Object.fromEntries(
    THEMES.map((theme) => [
      theme,
      Object.fromEntries(
        FAMILIES.flatMap((family) =>
          generateRamp(base[family], family, theme).map((hex, index) => [
            `${family}.${STEPS[index]}`,
            hexToTokenValue(hex),
          ])
        )
      ),
    ])
  );
}

/* ── Tipografia ───────────────────────────────────────────────── */

const FONT_SIZE_STEPS = [
  '3xs',
  '2xs',
  '1xs',
  'sm',
  'md',
  'lg',
  '1xl',
  '2xl',
  '3xl',
];

/** `1xs` é o degrau de corpo de texto: a escala cresce e decresce a partir dele. */
const BODY_STEP = FONT_SIZE_STEPS.indexOf('1xs');

/**
 * Uma razão modular por extremidade: a do mínimo é mais fechada que a do
 * máximo, que é o que faz a escala abrir conforme a viewport cresce em vez de
 * apenas escalar junto. O último degrau ganha um salto extra porque `3xl` é
 * tamanho de display, não a continuação natural da progressão.
 *
 * A distância entre mínimo e máximo do corpo não é livre: como o máximo cresce
 * mais rápido que o mínimo, ele também **encolhe** mais rápido descendo a
 * escala, e nos degraus abaixo do corpo pode passar por baixo do mínimo. Um
 * `clamp()` invertido é um degrau que diminui conforme a tela cresce. Daí o
 * piso: a folga do corpo precisa cobrir o quanto as duas razões divergem até o
 * menor degrau.
 */
function randomFontSizes() {
  const ratioMin = random(1.1, 1.18);
  const ratioMax = ratioMin + random(0.03, 0.09);
  const bodyMin = random(0.82, 0.95);
  const minimumSpread = (ratioMax / ratioMin) ** BODY_STEP;
  const bodyMax = bodyMin * Math.max(random(1.08, 1.2), minimumSpread * 1.01);
  const displayJump = random(1.15, 1.35);

  return Object.fromEntries(
    FONT_SIZE_STEPS.map((step, index) => {
      const distance = index - BODY_STEP;
      const last = index === FONT_SIZE_STEPS.length - 1;
      const min = bodyMin * ratioMin ** distance * (last ? displayJump : 1);
      const max = bodyMax * ratioMax ** distance * (last ? displayJump : 1);

      return [
        `typography.font-size.${step}`,
        buildClamp(min, Math.max(min, max)),
      ];
    })
  );
}

const weight = (name) => `{lui.typography.weight.${name}}`;

/**
 * Os pesos não são sorteados um a um: a hierarquia entre as variantes é o que
 * dá caráter à marca, e sorteio independente a desmancha. Cada entrada aqui é
 * um jogo coerente — o display pode ser leve e dramático ou pesado e sólido,
 * mas nunca mais leve que o corpo do texto que ele encima.
 */
const WEIGHT_SETS = [
  { display: 'light', strong: 'semibold', soft: 'regular', mid: 'medium' },
  { display: 'bold', strong: 'bold', soft: 'regular', mid: 'semibold' },
  { display: 'semibold', strong: 'semibold', soft: 'regular', mid: 'medium' },
  { display: 'regular', strong: 'medium', soft: 'light', mid: 'regular' },
];

function randomTypography() {
  const set = pick(WEIGHT_SETS);

  // A monoespaçada serve de título, não de corpo: em texto corrido ela custa
  // legibilidade sem devolver caráter.
  const bodyStacks = FONT_STACKS.filter((stack) => !/mono/i.test(stack.label));

  return {
    'typography.font-family.heading': [...pick(FONT_STACKS).value],
    'typography.font-family.body': [...pick(bodyStacks).value],
    ...randomFontSizes(),
    'typography.line-height.heading': Number(random(1.1, 1.35).toFixed(2)),
    'typography.line-height.body': Number(random(1.4, 1.7).toFixed(2)),
    'typography.weight.display': weight(set.display),
    'typography.weight.title': weight(set.strong),
    'typography.weight.subtitle': weight(set.soft),
    'typography.weight.headline': weight(set.strong),
    'typography.weight.subheadline': weight(set.soft),
    'typography.weight.block-title': weight(set.mid),
    'typography.weight.overtitle': weight(set.strong),
  };
}

/* ── Forma ────────────────────────────────────────────────────── */

const px = (value) => ({ value, unit: 'px' });

/**
 * Um raio base sorteado, e os cinco degraus derivados dele por proporção. Zero
 * é um resultado válido e desejável: marcas de canto vivo existem, e é a única
 * forma de o sorteio produzir uma.
 */
function randomRadii() {
  const md = pick([0, 2, 4, 6, 8, 10, 12, 16, 20]);
  const scale = { xs: 0.25, sm: 0.5, md: 1, lg: 1.5, xl: 2 };

  return Object.fromEntries(
    Object.entries(scale).map(([step, factor]) => [
      `border.radius.${step}`,
      px(Math.round(md * factor)),
    ])
  );
}

/* ── Grid ─────────────────────────────────────────────────────── */

const spacing = (value) => `{lui.spacing.fixed.${value}}`;

/**
 * Jogos de colunas plausíveis, do maior breakpoint para o menor. Nunca crescem
 * conforme a tela encolhe, e todos são divisíveis de formas que o layout
 * consegue usar.
 */
const COLUMN_SETS = [
  [12, 12, 8, 8, 4],
  [12, 12, 12, 6, 4],
  [16, 16, 12, 8, 4],
  [12, 12, 8, 4, 4],
  [8, 8, 8, 4, 4],
];

/**
 * Os breakpoints são sorteados em cascata, cada um a partir do anterior, porque
 * a única regra que não pode ser quebrada é a ordem: `sm` menor ou igual a
 * `1xs` produz media queries que nunca casam. `1xs` é sempre um pixel abaixo de
 * `sm` — ele marca o teto da faixa menor, não o piso de uma nova.
 */
function randomGrid() {
  const sm = roundTo(random(720, 840), 8);
  const md = roundTo(sm + random(192, 320), 8);
  const lg = roundTo(md + random(192, 320), 8);
  const xl = roundTo(lg + random(128, 224), 8);

  const [c1xl, clg, cmd, csm, c1xs] = pick(COLUMN_SETS);

  // Margens não encolhem conforme a tela cresce, e o gutter nunca passa da
  // margem do mesmo degrau — senão as colunas encostam entre si antes de
  // respeitarem a borda, e a página perde o respiro lateral.
  const marginLg = pick([24, 32, 40]);
  const marginMd = pick([16, 24, 32].filter((v) => v <= marginLg));
  const marginSm = pick([16, 24, 32].filter((v) => v <= marginMd));
  const margin1xs = pick([8, 16].filter((v) => v <= marginSm));

  const gapLarge = pick([16, 24, 32].filter((v) => v <= marginLg));
  const gapSmall = pick(
    [8, 16, 24].filter(
      (v) => v <= Math.min(gapLarge, marginMd, marginSm, margin1xs)
    )
  );

  return {
    'grid.breakpoint.1xs': px(sm - 1),
    'grid.breakpoint.sm': px(sm),
    'grid.breakpoint.md': px(md),
    'grid.breakpoint.lg': px(lg),
    'grid.breakpoint.1xl': px(xl),

    // O container é o maior breakpoint menos as margens dos dois lados: é o que
    // faz a última coluna terminar onde a margem começa.
    'grid.container.1xl': px(roundTo(xl - marginLg * 2, 8)),

    'grid.column.1xl': c1xl,
    'grid.column.lg': clg,
    'grid.column.md': cmd,
    'grid.column.sm': csm,
    'grid.column.1xs': c1xs,

    'grid.margin.lg': spacing(marginLg),
    'grid.margin.md': spacing(marginMd),
    'grid.margin.sm': spacing(marginSm),
    'grid.margin.1xs': spacing(margin1xs),

    'grid.gap.1xl': spacing(gapLarge),
    'grid.gap.lg': spacing(gapLarge),
    'grid.gap.md': spacing(gapSmall),
    'grid.gap.sm': spacing(gapSmall),
    'grid.gap.1xs': spacing(gapSmall),
  };
}

/* ── Marca ────────────────────────────────────────────────────── */

/**
 * Marca sorteada inteira. A identidade — nome e identificador — não entra no
 * sorteio: ela é do usuário, não da paleta.
 *
 * Parte dos valores padrão em vez do estado atual para que duas aleatorizações
 * seguidas não acumulem resíduo de uma na outra.
 */
export function randomBrand(defaults, identity) {
  const state = structuredClone(defaults);

  state.name = identity.name;
  state.slug = identity.slug;
  state.colors = randomColors();

  Object.assign(state.foundation, {
    ...randomTypography(),
    ...randomRadii(),
    ...randomGrid(),
    'opacity.disabled': Number(roundTo(random(0.3, 0.6), 0.05).toFixed(2)),
  });

  return state;
}
