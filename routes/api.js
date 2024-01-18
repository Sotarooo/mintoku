require('dotenv').config();

exports.get = async function () {
  const url = new URL('tokugi.json', process.env.FIREBASE_URL).href;
  const res = await fetch(url);
  const json_res = await res.json();
  if (json_res === null) {
    return [];
  }
  return Object.keys(json_res).map((key) => {
    return { id: key, ...json_res[key] };
  });
};

exports.getId = async function (id) {
  const url = new URL(`tokugi/${id}.json`, process.env.FIREBASE_URL).href;
  const res = await fetch(url);
  return await res.json();
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

exports.patch = async function (id, tokugi) {
  const url = new URL(`tokugi/${id}.json`, process.env.FIREBASE_URL).href;

  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tokugi),
  });
};
