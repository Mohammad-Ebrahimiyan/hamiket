import type { MenuActionKey, Notice, NoticeCode } from './model/tree.types';

export const messages = {
  app: {
    title: 'درخت حساب‌ها',
    subtitle:
      'برای مدیریت هر شاخه روی آن کلیک راست کنید (در لمسی: دکمه‌ی ⋮، با صفحه‌کلید: Shift+F10). با کلیک روی شاخه آن را باز و بسته کنید.',
  },
  tree: {
    ariaLabel: 'درخت حساب‌ها',
    empty: 'این درخت خالی است. با دکمه‌ی «افزودن» اولین زیرشاخه را بسازید.',
    cutPending: 'در انتظار چسباندن',
    add: 'افزودن',
    addChildTo: (label: string) => `افزودن زیرشاخه به «${label}»`,
    moreActions: (label: string) => `عملیات «${label}»`,
  },
  toolbar: {
    undo: 'بازگردانی',
    redo: 'تکرار',
    clipboardCopy: (label: string) => `کپی‌شده: ${label}`,
    clipboardCut: (label: string) => `برش‌خورده: ${label}`,
  },
  menu: {
    ariaLabel: (label: string) => `منوی عملیات «${label}»`,
    items: {
      cut: 'برش دادن',
      copy: 'کپی کردن',
      paste: 'پیست کردن',
      delete: 'حذف',
      addChild: 'افزودن زیرشاخه',
    } satisfies Record<MenuActionKey, string>,
  },
  addChild: {
    title: 'افزودن زیرشاخه',
    parentHint: (parent: string) => `زیرشاخه‌ی جدید به «${parent}» اضافه می‌شود.`,
    fieldLabel: 'عنوان زیرشاخه',
    helper: 'برای ثبت Enter و برای بستن Escape را بزنید.',
    submit: 'افزودن',
    cancel: 'انصراف',
  },
  delete: {
    title: 'حذف شاخه',
    body: (label: string) =>
      `آیا از حذف «${label}» مطمئن هستید؟ این کار قابل بازگشت نیست (مگر با بازگردانی).`,
    confirm: 'حذف',
    cancel: 'انصراف',
  },
  notices: {
    CUT: (label) => `«${label}» برش داده شد. مقصد را انتخاب و پیست کنید.`,
    COPIED: (label) => `«${label}» با تمام زیرشاخه‌هایش کپی شد.`,
    PASTED: (label) => `«${label}» چسبانده شد.`,
    MOVED: (label) => `«${label}» منتقل شد.`,
    DELETED: (label) => `«${label}» حذف شد.`,
    DELETED_CLIPBOARD_CLEARED: (label) => `«${label}» حذف شد و کلیپ‌بورد پاک شد.`,
    ADDED: (label) => `«${label}» افزوده شد.`,
    UNDONE: () => 'آخرین تغییر بازگردانده شد.',
    REDONE: () => 'تغییر دوباره اعمال شد.',
    NOT_FOUND: () => 'شاخه پیدا نشد؛ ممکن است قبلاً حذف شده باشد.',
    IS_ROOT: () => 'ریشه قابل برش یا حذف نیست.',
    HAS_CHILDREN: () => 'فقط شاخه‌ی بدون فرزند قابل برش یا حذف است.',
    CLIPBOARD_EMPTY: () => 'ابتدا یک شاخه را کپی یا برش دهید.',
    SELF_TARGET: () => 'نمی‌توان شاخه را روی خودش پیست کرد.',
    CYCLE: () => 'نمی‌توان شاخه را داخل زیرشاخه‌ی خودش پیست کرد.',
    SOURCE_MISSING: () => 'شاخه‌ی برش‌خورده دیگر وجود ندارد.',
    SOURCE_HAS_CHILDREN: () => 'شاخه‌ی برش‌خورده اکنون فرزند دارد و قابل انتقال نیست.',
    EMPTY: () => 'عنوان زیرشاخه نمی‌تواند خالی باشد.',
    TOO_LONG: () => 'عنوان زیرشاخه حداکثر ۸۰ نویسه می‌تواند باشد.',
  } satisfies Record<NoticeCode, (label: string) => string>,
} as const;

export const noticeText = (code: NoticeCode, label = ''): string => messages.notices[code](label);

export const formatNotice = (notice: Notice): string => noticeText(notice.code, notice.label);
