function save_options() {
   let rx = document.getElementById("Rx").value;
   let ry = document.getElementById("Ry").value;

   chrome.storage.sync.set({
      disp_x : rx,
      disp_y : ry
   }, () => {
      let status = document.getElementById('status');
      status.textContent = "Options saved.";
      setTimeout(() => {
         status.textContent = "";
      }, 750);
   });
}

function restore_options() {
   chrome.storage.sync.get(["disp_x", "disp_y"], (items) => {
      document.getElementById("Rx").value = items.disp_x;
      document.getElementById("Ry").value = items.disp_y;
   });
}

document.getElementById('save').addEventListener('click',save_options);
document.addEventListener('DOMContentLoaded', restore_options);
