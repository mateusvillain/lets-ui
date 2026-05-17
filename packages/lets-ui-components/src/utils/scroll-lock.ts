export function lockBodyScroll(): void {
  const count = parseInt(document.body.dataset['luiLockCount'] ?? '0', 10);
  document.body.dataset['luiLockCount'] = String(count + 1);
  document.body.style.overflow = 'hidden';
}

export function unlockBodyScroll(): void {
  const count = Math.max(
    0,
    parseInt(document.body.dataset['luiLockCount'] ?? '0', 10) - 1
  );
  document.body.dataset['luiLockCount'] = String(count);
  if (count === 0) document.body.style.overflow = '';
}
