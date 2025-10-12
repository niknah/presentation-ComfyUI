export default async function() {
  const resp = await fetch('/api/userInfo');
  const userInfo = await resp.json();
  if (userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }
  return userInfo;
}
