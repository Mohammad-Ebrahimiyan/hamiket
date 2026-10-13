import type { CSSObject } from '@mui/material/styles';

const ARROW_WIDTH = 10;
const ARROW_HEIGHT = 14;
const LINE = '2px';

const H_GAP = '24px';
const V_INDENT = '12px';
const V_STUB = '22px';
const V_PAD = '4px';

function arrowImage(color: string, rtl: boolean): string {
  const path = rtl ? 'M9 1 L2 7 L9 13' : 'M1 1 L8 7 L1 13';
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
  const entry = (pseudo: string) => `& > li > [data-tree-box]${pseudo}, & > li > button${pseudo}`;
  const lastEntry = (pseudo: string) =>
    `& > li:last-of-type > [data-tree-box]${pseudo}, & > li:last-of-type > button${pseudo}`;

  const arrow: CSSObject = {
    content: '""',
    position: 'absolute',
    top: '50%',
    insetInlineStart: `-${ARROW_WIDTH}px`,
    width: `${ARROW_WIDTH}px`,
    height: `${ARROW_HEIGHT}px`,
    transform: 'translateY(-50%)',
    backgroundImage: arrowImage(color, rtl),
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
  };

  const vertical: CSSObject = {
    marginInlineStart: V_INDENT,
    '& > li': {
      display: 'block',
      position: 'relative',
      paddingBlock: V_PAD,
      paddingInlineStart: V_STUB,
    },
    '& > li:not(:last-of-type)::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      insetInlineStart: 0,
      borderInlineStart: line,
    },

    [entry('::after')]: {
      content: '""',
      boxSizing: 'border-box',
      position: 'absolute',
      top: `calc(50% - 1px)`,
      insetInlineStart: `-${V_STUB}`,
      width: V_STUB,
      borderTop: line,
    },

    [lastEntry('::after')]: {
      top: `-${V_PAD}`,
      height: `calc(50% + ${V_PAD} + 1px)`,
      borderTop: 0,
      borderInlineStart: line,
      borderBottom: line,
    },
    [entry('::before')]: arrow,
  };

  const horizontal: CSSObject = {
    marginInlineStart: H_GAP,
    // خط از والد تا ستون عمودی
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      insetInlineStart: `-${H_GAP}`,
      width: H_GAP,
      borderTop: line,
    },
    '& > li': {
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      paddingBlock: '6px',
      paddingInlineStart: H_GAP,
    },
    // خط افقی هر فرزند
    '& > li::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      insetInlineStart: 0,
      width: H_GAP,
      borderTop: line,
    },
    // ستون عمودی مشترک
    '& > li::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      insetInlineStart: 0,
      borderInlineStart: line,
    },
    '& > li:first-of-type::after': { top: '50%' },
    '& > li:last-of-type::after': { bottom: '50%' },
    '& > li:only-of-type::after': { display: 'none' },
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
