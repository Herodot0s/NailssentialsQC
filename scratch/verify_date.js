
const dateStr = '2026-05-14';
const dateObj = new Date(dateStr);
console.log('Date ISO:', dateObj.toISOString());
console.log('UTCDay:', dateObj.getUTCDay());
console.log('LocalDay:', dateObj.getDay());
