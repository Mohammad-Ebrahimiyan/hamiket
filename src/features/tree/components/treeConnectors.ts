import type { CSSObject } from '@emotion/react';

import { COLUMN_GAP, CURVE_HEIGHT, NODE_HEIGHT, ROW_GAP } from './TreeLayout';

const ARROW_WIDTH = 14;
const ARROW_HEIGHT = 18;
const LINE = '2px';

const CENTER = NODE_HEIGHT / 2;

const V_INDENT = 12;
const V_STUB = 28;
const V_PAD = 4;

const px = (value: number) => `${value}px`;

function arrowImage(color: string, rtl: boolean): string {
  const mid = ARROW_HEIGHT / 2;
  const path = rtl
    ? `M${ARROW_WIDTH - 1} 1 L2 ${mid} L${ARROW_WIDTH - 1} ${ARROW_HEIGHT - 1}`
    : `M1 1 L${ARROW_WIDTH - 2} ${mid} L1 ${ARROW_HEIGHT - 1}`;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${ARROW_WIDTH}' height='${ARROW_HEIGHT}' ` +
    `viewBox='0 0 ${ARROW_WIDTH} ${ARROW_HEIGHT}'><path d='${path}' fill='none' stroke='${color}' ` +
    `stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

interface ConnectorOptions {
  color: string;
  rtl: boolean;
  desktopQuery: string;
  mobileQuery: string;
}

export function treeConnectorStyles({
  color,
  rtl,
  desktopQuery,
  mobileQuery,
}: ConnectorOptions): CSSObject {
  const line = `${LINE} solid ${color}`;
  const entry = (pseudo: string, scope = '') =>
    `& > li${scope} > [data-tree-box]${pseudo}, & > li${scope} > button${pseudo}`;

  const arrow: CSSObject = {
    content: '""',
    position: 'absolute',
    top: '50%',
    insetInlineStart: px(-ARROW_WIDTH),
    width: px(ARROW_WIDTH),
    height: px(ARROW_HEIGHT),
    transform: 'translateY(-50%)',
    backgroundImage: arrowImage(color, rtl),
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
  };

  const curve = (width: number): CSSObject => ({
    content: '""',
    boxSizing: 'border-box',
    position: 'absolute',
    top: `calc(50% - ${CURVE_HEIGHT}px + 1px)`,
    insetInlineStart: px(-width),
    width: px(width),
    height: px(CURVE_HEIGHT),
    borderBottom: line,
    borderInlineStart: line,
    borderEndStartRadius: `${width}px ${CURVE_HEIGHT}px`,
  });

  const straight: CSSObject = {
    top: 'calc(50% - 1px)',
    height: 0,
    borderInlineStart: 0,
    borderBottom: line,
    borderEndStartRadius: 0,
  };

  const vertical: CSSObject = {
    marginInlineStart: px(V_INDENT),
    '& > li': {
      display: 'block',
      position: 'relative',
      paddingBlock: px(V_PAD),
      paddingInlineStart: px(V_STUB),
    },
    '& > li:not(:last-of-type)::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      insetInlineStart: 0,
      borderInlineStart: line,
    },
    [entry('::after')]: curve(V_STUB),
    [entry('::after', ':last-of-type')]: {
      top: px(-V_PAD),
      height: `calc(50% + ${V_PAD}px + 1px)`,
    },
    [entry('::before')]: arrow,
  };

  const horizontal: CSSObject = {
    marginInlineStart: px(COLUMN_GAP),
    '&::before': {
      content: '""',
      position: 'absolute',
      top: px(CENTER - 1),
      insetInlineStart: px(-COLUMN_GAP),
      width: px(COLUMN_GAP),
      borderTop: line,
    },
    '& > li': {
      display: 'flex',
      alignItems: 'flex-start',
      position: 'relative',
      paddingInlineStart: px(COLUMN_GAP),
    },
    '& > li + li': { marginBlockStart: px(ROW_GAP) },
    '& > li::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: px(-ROW_GAP),
      insetInlineStart: 0,
      borderInlineStart: line,
    },
    '& > li:first-of-type::after': { top: px(CENTER) },
    '& > li:last-of-type::after': { bottom: 'auto', height: px(CENTER - CURVE_HEIGHT + 1) },
    '& > li:only-of-type::after': { display: 'none' },
    [entry('::after')]: curve(COLUMN_GAP),
    [entry('::after', ':first-of-type')]: straight,
    [entry('::after', ':only-of-type')]: straight,
    [entry('::before')]: arrow,
  };

  return {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    position: 'relative',
    [mobileQuery]: vertical,
    [desktopQuery]: horizontal,
  };
}
