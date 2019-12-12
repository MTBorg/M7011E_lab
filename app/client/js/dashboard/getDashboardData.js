// import prosumerFields from "../gqlFragment";

const API_ADDRESS = "http://localhost:8080/graphql";
const QUERY = `
query Prosumers {
	... prosumerFields
}
${prosumerFields}
`;
async function getDashboardData() {
  console.log("in getDashboardData()");
  await fetch(API_ADDRESS, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: "{active}"
    })
  })
    .then(res => res.json())
    .then(res => console.log("Data returned:", res.data))
    .catch(err => console.log("getDashboardData fetch error:\n" + err));
}
