
const now = new Date();
const today = new Date();
today.setHours(0, 0, 0, 0);

console.log('Current UTC:', now.toISOString());
console.log('Server Local Time:', now.toString());
console.log('Calculated Today (UTC):', today.toISOString());
console.log('Day of week:', today.getDay());

// Manila Time (UTC+8)
const manilaNow = new Date(now.getTime() + (8 * 60 * 60 * 1000));
const manilaTodayStr = manilaNow.toISOString().split('T')[0];
console.log('Manila Today Str:', manilaTodayStr);
