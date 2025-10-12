export default function () {
  const formatter1 = new Intl.DateTimeFormat('sv-SE', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  return formatter1.format(new Date()).replace(/[^\d]/g, '');
}
