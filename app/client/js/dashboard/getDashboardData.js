const API_ADDRESS = "http://localhost:8080/graphql";
const QUERY = `
	query Prosumers {
		id
	}
`;
async function getDashboardData() {
  console.log("in getDashboardData()");
  await fetch(API_ADDRESS, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*"
    },
    body: JSON.stringify({
      query: "{prosumers {id}}"
    })
  })
    .then(res => res.json())
    .then(res => console.log("Data returned:", res.data))
    .catch(err => console.log("getDashboardData fetch error:\n" + err));
}
