function saveOptions() {
   let rx = document.getElementById("Rx").value;
   let ry = document.getElementById("Ry").value;
   let d = document.getElementById("slider").value;
   chrome.storage.sync.set({
      disp_x : rx,
      disp_y : ry,
      rate   : d
   }, () => {
      let status = document.getElementById('status');
      status.textContent = "Options saved.";
      setTimeout(() => {
         status.textContent = "";
      }, 750);
   });
}

function restoreOptions() {
   chrome.storage.sync.get(["disp_x", "disp_y","rate"], (items) => {
      document.getElementById("Rx").value = items.disp_x;
      document.getElementById("Ry").value = items.disp_y;
      document.getElementById("slider").value = items.rate;
      updateSlider();
   });
}

function updateSlider(){
   let elem = document.getElementById("mix");
   let slider = document.getElementById('slider');
   elem.innerText = Number(slider.value).toFixed(2);
}

document.getElementById('save').addEventListener("click",saveOptions);
document.getElementById('slider').addEventListener("input", updateSlider);
document.addEventListener('DOMContentLoaded', restoreOptions);
