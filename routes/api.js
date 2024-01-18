require('dotenv').config();

exports.get = async function () {
  const url = new URL('tokugi.json', process.env.FIREBASE_URL).href;
  const res = await fetch(url);
  return Object.values(await res.json());
};

exports.post = async function (tokugi) {
  const url = new URL('tokugi.json', process.env.FIREBASE_URL).href;
  await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tokugi),
  });
};

exports.put = async function (tokugi) {
  const url = new URL('tokugi.json', process.env.FIREBASE_URL).href;
  await fetch(url, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tokugi),
  });
};
