import Link from 'next/link';

export function Nav() {
  const cls = 'px-3 py-2 rounded-md hover:bg-slate-200';
  return (
    <nav className="flex flex-wrap gap-2 text-sm">
      <Link className={cls} href="/dashboard">Boshqaruv paneli</Link>
      <Link className={cls} href="/add">So'z qo'shish</Link>
      <Link className={cls} href="/review">Takrorlash</Link>
      <Link className={cls} href="/games">Mini-o'yinlar</Link>
      <Link className={cls} href="/settings">Sozlamalar</Link>
    </nav>
  );
}
