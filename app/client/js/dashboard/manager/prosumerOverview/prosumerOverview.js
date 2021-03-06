registerPollCallback(e => {
  let numBlackout = 0;
  e.detail.data.prosumers.forEach(prosumer => {
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
				<span id="${onlineCellId}" class="dot-status ${
        prosumer.account.online ? `dot-status-online"` : `dot-status-offline"`
      }></span>
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
      const onlineCell = document.getElementById(onlineCellId);
      // Updates the prosumers online status
      if (
        !onlineCell.classList.replace(
          "dot-status-offline",
          prosumer.account.online ? "dot-status-online" : "dot-status-offline"
        )
      ) {
        onlineCell.classList.replace(
          "dot-status-online",
          prosumer.account.online ? "dot-status-online" : "dot-status-offline"
        );
      }
    }
  });

  document.getElementById("prosumer-status").innerText =
    numBlackout > 0
      ? numBlackout > 1
        ? `${numBlackout} prosumers are currently experiencing blackouts`
        : `${numBlackout} prosumer is currently experiencing a blackout`
      : `No prosumers are currently exeriencing blackouts`;
});
