// const POLL_INTERVAL = 3000;
document.addEventListener("DOMContentLoaded", () => {
  pollFunc(updateData, POLL_INTERVAL);
});

async function updateData() {
  const authToken = getCookie("authToken", document.cookie);
  try {
    const response = await fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query: `
				{
					prosumers {
						id
						blocked
						blackout
						account {
							online
							email
						}
					}
				}
				`
      })
    });
    const json = await response.json();
    let numBlackout = 0;
    json.data.prosumers.forEach(prosumer => {
      if (prosumer.blackout) numBlackout++;
      const rowId = `prosumer-${prosumer.id}`;
      const onlineCellId = `online-status-${prosumer.id}`;
      const blockStatusCellId = `blocked-status-${prosumer.id}`;
      const blackoutCellId = `blackout-status-${prosumer.id}`;
      if (!document.getElementById(rowId)) {
        const table = document.getElementById("prosumer-overview-body");

        const row = table.insertRow(0);
        row.id = rowId;

        // Insert cells
        const idCell = row.insertCell(0);
        const onlineCell = row.insertCell(1);
        const blockBtnCell = row.insertCell(2);
        const blockStatusCell = row.insertCell(3);
        const blackoutCell = row.insertCell(4);

        idCell.innerHTML = `
				<a href="/prosumer-summary/${prosumer.id}">${prosumer.id} - ${prosumer.account.email}</a>
				`;
        onlineCell.innerHTML = `
				<span id="${onlineCellId}"> ${prosumer.account.online ? "\u2714" : ""}</span>
				`;
        blockBtnCell.innerHTML = `
				<button class="btn btn-danger" onclick="blockProsumer(${prosumer.id})">Block</button>
				`;
        blockStatusCell.innerHTML = `
					<span id="${blockStatusCellId}">${prosumer.blocked ? "\u2714" : ""}</span>
				`;
        blackoutCell.innerHTML = `
				<span id=${blackoutCellId}> ${prosumer.blackout ? "\u2714" : ""} </span>
				`;
      } else {
        document.getElementById(blockStatusCellId).innerText = prosumer.blocked
          ? "\u2714"
          : "";
        document.getElementById(blackoutCellId).innerText = prosumer.blackout
          ? "\u2714"
          : "";
        document.getElementById(onlineCellId).innerText = prosumer.account
          .online
          ? "\u2714"
          : "";
      }
    });
    document.getElementById("prosumer-status").innerText =
      numBlackout > 0
        ? numBlackout > 1
          ? `${numBlackout} prosumers are currently experiencing blackouts`
          : `${numBlackout} prosumer is currently experiencing a blackout`
        : `No prosumers are currently exeriencing blackouts`;
  } catch (error) {
    alert(`Failed to fetch prosumers: ${error}`);
  }
}
